import 'react-native-url-polyfill/auto';
import { Account, Avatars, Client, Databases, ID, Query } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.foxysama.aora',
    projectId: '66b08623003a1a4acb7a',
    databaseId: '66b087b60034f470a317',
    userCollectionId: '66b087ce0027fab1dc82',
    videoCollectionId: '66b087ed0011d3c6b249',
    storageId: '66b088e5000da26b3b0c'
};

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(config.endpoint) // Your Appwrite Endpoint
    .setProject(config.projectId) // Your project ID
    .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (username, email, password) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials();

        await signIn(email, password);

        const newUser = await databases.createDocument(config.databaseId, config.userCollectionId, ID.unique(), {
            accountId: newAccount.$id,
            email,
            username,
            avatar: avatarUrl
        });

        return newUser;
    } catch (error) {
        console.log('Error creating account', error);
        throw error;
    }
};

export const signIn = async (email, password) => {
    try {
        const session = await account.createEmailPasswordSession(email, password);

        return session;
    } catch (error) {
        throw new Error(error);
    }
};

export const getCurrentUser = async () => {
    try {
        const currentAccount = await account.get();

        if (!currentAccount) throw Error;

        const currentUser = await databases.listDocuments(config.databaseId, config.userCollectionId, [
            Query.equal('accountId', currentAccount.$id)
        ]);

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
    }
};
