import Header from "@/components/Header";
import RightSideBar from "@/components/RightSideBar";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import { getLoggedInUser } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";

const Home = async () => {
  const loggedIn = await getLoggedInUser()
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
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1250.35}
        />
      </div>
      <RightSideBar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 2500 }, { currentBalance: 500 }]}
      />
    </section>
  );
};

export default Home;
