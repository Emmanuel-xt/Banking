import Header from "@/components/Header";
import TotalBalanceBox from "@/components/TotalBalanceBox";
import React from "react";

const Home = () => {
  const loggedIn = {
    firstname: "Emmanuel",
  };
  return (
    <section className="home">
      <div className="home-content">
        <Header
          type="greeting"
          title="Welcome"
          user={loggedIn?.firstname || "Guest"}
          subtext="Access and manage your accounts seamlessly"
        />
        <TotalBalanceBox
          accounts={[]}
          totalBanks={1}
          totalCurrentBalance={1250.35}
        />
      </div>
    </section>
  );
};

export default Home;
