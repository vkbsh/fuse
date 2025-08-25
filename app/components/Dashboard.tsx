import Main from "~/components/Main";
import Header from "~/components/Header";
import AutoReconnectWallet from "~/components/AutoReconnectWallet";

export default function Dashboard() {
  return (
    <>
      <AutoReconnectWallet />
      <Header />
      <Main />
    </>
  );
}
