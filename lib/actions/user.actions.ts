'use server'

import { cookies } from "next/headers"
import { createAdminClient, createSessionClient } from "../appwrite"
import { parseStringify } from "../utils"
import { ID } from "node-appwrite"

export const signIn = async ({ email, password }: signInProps) => {
    console.log('About to sign in 🧐')
    try {

        const { account } = await createAdminClient();

        const response = await account.createEmailPasswordSession(email, password)

        console.log('Sign in successfull 😁', response)

        return parseStringify(response)

    } catch (error) {
        console.log(error)
    }
}
export const signUp = async (userData: SignUpParams) => {
    const { email, password, firstName, lastName } = userData;
    console.log('avout to sign up', userData)
    try {
        const { account } = await createAdminClient();

        const newUserAccount = await account.create(
            ID.unique(),
            email,
            password,
            `${firstName} ${lastName}`
        );

        const session = await account.createEmailPasswordSession(email, password);

        cookies().set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        console.log('finished sign up....🤞')

        return parseStringify(newUserAccount);

    } catch (error) {
        console.log(error)
    }
}

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();

        const user = await account.get();

        return parseStringify(user);
    } catch (error) {
        console.log(error)
        return null;
    }
}