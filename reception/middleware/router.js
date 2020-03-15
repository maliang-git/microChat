import Cookies from "js-cookie";
export default function({ route, req, res, redirect }) {
  let isClient = process.client;
  let isServer = process.server;
  if (isClient) {
    const userToken = Cookies.get("userToken")
      ? Cookies.get("userToken")
      : null;
    if (!userToken) {
      redirect("/");
    }
  }
}
