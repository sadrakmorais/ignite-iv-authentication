import type { GetServerSideProps, NextPage } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";

import styles from "../styles/Home.module.css";
import { withSSRGuest } from "../utils/withSSRGuest";

const Home: NextPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  const handleSubmitForm = async (event: FormEvent) => {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  };

  return (
    <div className={styles.container}>
      <form action="" className={styles.form} onSubmit={handleSubmitForm}>
        <label htmlFor="email">E-mail</label>
        <input
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label htmlFor="email">Password</label>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit"> Login</button>
      </form>
    </div>
  );
};

export default Home;

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {},
  };
});
