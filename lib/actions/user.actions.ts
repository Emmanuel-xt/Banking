'use server'

import { cookies } from "next/headers"
import { createAdminClient, createSessionClient } from "../appwrite"
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils"
import { ID, Query } from "node-appwrite"
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid"
import { plaidClient } from "../plaid"
import { revalidatePath } from "next/cache"
import { addFundingSource, createDwollaCustomer } from "./dwolla.action"
const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID,

} = process.env


export const getUserInfo = async ({ userId }: getUserInfoProps) => {
    try {
        const { database } = await createAdminClient()

        const user = await database.listDocuments(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )

        return parseStringify(user.documents[0])
    } catch (error) {

    }
}

export const signIn = async ({ email, password }: signInProps) => {
    console.log('About to sign in 🧐')
    try {

        const { account } = await createAdminClient();

        const session = await account.createEmailPasswordSession(email, password)
        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });

        const response = await getUserInfo({ userId: session.userId })

        const user = await getUserInfo({ userId: response.$id })


        console.log('Sign in successfull 😁', response)

        return parseStringify(response)

    } catch (error) {
        console.log(error)
    }
}
export const signUp = async ({ password, ...userData }: SignUpParams) => {
    const { email, firstName, lastName } = userData;
    let newUserAccount;
    console.log('avout to sign up', userData)
    try {
        const { account, database } = await createAdminClient();

        newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        if (!newUserAccount) {
            throw new Error('Error creating User')
        }

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: 'personal'
        })

        if (!dwollaCustomerUrl) {
            throw new Error('Error creating dwollaCustomer')
        }

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl)

        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl
            }
        )

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        console.log('finished sign up....🤞')

        return parseStringify(newUser);

    } catch (error) {
        console.log(error)
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();

        const result = await account.get();
        console.log('result from getLogged in user function -->', result)

        const user = await getUserInfo({ userId: result.$id });

        console.log('user from getLogged in user function -->', user)



        return parseStringify(user);
    } catch (error) {
        console.log(error)
        return null;
    }
}

export const logOutAccount = async () => {
    console.log('user about to be logged out ⛽')
    try {
        const { account } = await createSessionClient();

        cookies().delete('appwrite-session')

        await account.deleteSession('current')

        console.log('log out successfull 🔏')
    } catch (error) {
        console.log('error logging out 🧐', error)
    }
}

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            },
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }

        const response = await plaidClient.linkTokenCreate(tokenParams)
        console.log('Link token functions response -->', response)

        return parseStringify({ linkToken: response.data.link_token })
    } catch (error) {
        console.log(error)
    }
}

export const createBankAccount = async ({
    userId,
    bankId: itemId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId
}: createBankAccountProps) => {

    try {
        const { database } = await createAdminClient()

        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId: itemId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        )

        console.log('Bank created 💰💰💰 ->', bankAccount)

        return parseStringify(bankAccount)

    } catch (error) {
        console.log('Error creating bank account -->', error)

    }

}

// This function exchanges a public token for an access token and item ID
export const exchangePublicToken = async ({
    publicToken,
    user,
}: exchangePublicTokenProps) => {
    try {
        // Exchange public token for access token and item ID
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken,
        });

        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        // Get account information from Plaid using the access token
        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken,
        });

        const accountData = accountsResponse.data.accounts[0];

        // Create a processor token for Dwolla using the access token and account ID
        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse =
            await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        // Create a funding source URL for the account using the Dwolla customer ID, processor token, and bank name
        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken,
            bankName: accountData.name,
        });

        // If the funding source URL is not created, throw an error
        if (!fundingSourceUrl) throw Error;

        // Create a bank account using the user ID, item ID, account ID, access token, funding source URL, and sharable ID
        const bankCreated = await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountData.account_id,
            accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountData.account_id),
        });




        // Revalidate the path to reflect the changes
        revalidatePath("/");

        // Return a success message
        return parseStringify({
            publicTokenExchange: "complete",
        });
    } catch (error) {
        // Log any errors that occur during the process
        console.error("An error occurred while creating exchanging token:", error);
    }
};

export const getBanks = async ({ userId }: getBanksProps) => {
    try {
        const { database } = await createAdminClient()

        const banks = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('userId', [userId])]
        )

        return parseStringify(banks.documents)
    } catch (error) {

    }
}
export const getBank = async ({ documentId }: getBankProps) => {
    try {
        const { database } = await createAdminClient()

        const bank = await database.listDocuments(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            [Query.equal('$id', [documentId])]
        )

        return parseStringify(bank.documents[0])
    } catch (error) {

    }
}