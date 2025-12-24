import { Client, Account, Databases } from "appwrite";

const client = new Client()
    .setEndpoint("https://nyc.cloud.appwrite.io/v1")
    .setProject("694c5e9000133dc2b815");

const account = new Account(client);
const databases = new Databases(client);

export { client, account, databases };
