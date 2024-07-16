import { logOutAccount } from "@/lib/actions/user.actions";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React from "react";

const Footer = ({ user, type }: FooterProps) => {
  const router = useRouter();
  // console.log("user -> ", user);
  const handleLogOut = async () => {
    const loggedOut = await logOutAccount();
    // if (loggedOut) {
    //   router.push("/sign-in");
    // }
  };
  return (
    <footer className="footer">
      <div className={type === "mobile" ? "footer_name-mobile" : "footer_name"}>
        <p className="text-xl font-bold text-gray-500">{user?.firstName[0]}</p>
      </div>
      <div
        className={type === "mobile" ? "footer_email-mobile" : "footer_email"}
      >
        <p className="text-14 truncate font-semibold text-gray-700">
          {user?.firstName}
        </p>
        <p className="text-14 truncate font-normal text-gray-600">
          {user?.email}
        </p>
      </div>

      <div className="footer_image" onClick={handleLogOut}>
        <Image src="/icons/logOut.svg" fill alt="logout icon" />
      </div>
    </footer>
  );
};

export default Footer;
