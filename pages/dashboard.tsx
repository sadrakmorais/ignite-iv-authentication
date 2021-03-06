import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Can } from "../components/Can";

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  return (
    <>
      <button onClick={signOut}>Sign Out</button>
      <h1>Dashboard</h1>
      <span>Olá {user?.email}</span>

      <Can permissions={["metrics.list"]}>
        <h2>Métricas</h2>
      </Can>
    </>
  );
}
