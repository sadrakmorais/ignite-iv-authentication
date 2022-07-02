import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Can } from "../components/Can";

export default function Metrics() {
  const { user } = useContext(AuthContext);

  return (
    <>
      <h1>Metrics</h1>
      <span>Olá {user?.email}</span>

      <Can permissions={["metrics.list"]}>
        <h2>Métricas</h2>
      </Can>
    </>
  );
}
