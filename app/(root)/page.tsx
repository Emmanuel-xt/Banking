import Header from "@/components/Header";
import RightSideBar from "@/components/RightSideBar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getAccount, getAccounts } from "@/lib/actions/banks.actions";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";

const Home = async ({ searchParams: { id, page } }: SearchParamProps) => {
  const loggedIn = await getLoggedInUser();
  const accounts = await getAccounts({
    userId: loggedIn?.$id,
  });
  if (!accounts) return;

  const accountData = accounts?.data;

  console.log('accounts =>' , accounts , 'account data =>' , accountData)

  const appwriteItemId = (id as string) || accounts?.data[0]?.appwriteItemId;

  const account = await getAccount({ appwriteItemId });
 
  if(!loggedIn) redirect('/sign-in')
  return (
    <section className="home">
      <div className="home-content">
        <Header
          type="greeting"
          title="Welcome"
          user={loggedIn?.name || "Guest"}
          subtext="Access and manage your accounts seamlessly"
        />
        <TotalBalanceBox
          accounts={accountData}
          totalBanks={accounts?.totalBanks}
          totalCurrentBalance={accounts?.totalCurrentBalance}
        />
      </div>
      <RightSideBar
        user={loggedIn}
        transactions={accounts?.transactions}
        banks={accountData?.slice(0 , 2)}
      />
    </section>
  );
};

export default Home;
