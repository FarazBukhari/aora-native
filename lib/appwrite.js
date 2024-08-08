import 'react-native-url-polyfill/auto';
import { Account, Avatars, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

export const config = {
    endpoint: 'https://cloud.appwrite.io/v1',
    platform: 'com.foxysama.aora',
    projectId: '66b08623003a1a4acb7a',
    databaseId: '66b087b60034f470a317',
    userCollectionId: '66b1ff4c0019c8e5c9ca',
    videoCollectionId: '66b2017b002a89ab7c65',
    storageId: '66b088e5000da26b3b0c'
};

const { endpoint, platform, projectId, databaseId, userCollectionId, videoCollectionId, storageId } = config;

// Init your React Native SDK
const client = new Client();

client
    .setEndpoint(endpoint) // Your Appwrite Endpoint
    .setProject(projectId) // Your project ID
    .setPlatform(platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (username, email, password) => {
    try {
        const newAccount = await account.create(ID.unique(), email, password, username);

        if (!newAccount) throw Error;

        const avatarUrl = avatars.getInitials(username);

        await signIn(email, password);

        const newUser = await databases.createDocument(databaseId, userCollectionId, ID.unique(), {
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

        const currentUser = await databases.listDocuments(databaseId, userCollectionId, [Query.equal('accountId', currentAccount.$id)]);

        if (!currentUser) throw Error;

        return currentUser.documents[0];
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
};

export const getAllPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc('$createdAt')]);

        return posts.documents;
    } catch (error) {
        console.log('error getAllPosts', error);
        throw new Error(error);
    }
};

export const getLatestPosts = async () => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.orderDesc('$createdAt', Query.limit(7))]);

        return posts.documents;
    } catch (error) {
        console.log('error getLatestPosts', error);
        throw new Error(error);
    }
};

export const searchPosts = async (query) => {
    try {
        const posts = await databases.listDocuments(databaseId, videoCollectionId, [Query.search('title', query)]);

        return posts.documents;
    } catch (error) {
        console.log('error searchPosts', error);
        throw new Error(error);
    }
};

export const getUserPosts = async (userId) => {
    try {
        if (userId) {
            const posts = await databases.listDocuments(databaseId, videoCollectionId, [
                Query.equal('creator', userId),
                Query.orderDesc('$createdAt')
            ]);

            return posts.documents;
        }
    } catch (error) {
        console.log('error getUserPosts', error);
        throw new Error(error);
    }
};

export const getSavedUserPosts = async (userId) => {
    try {
        if (userId) {
            const posts = await databases.getDocument(databaseId, userCollectionId, userId);

            return posts.savedVideos;
        }
    } catch (error) {
        console.log('error getSavedUserPosts', error);
        throw new Error(error);
    }
};

export const signOut = async () => {
    try {
        const session = await account.deleteSession('current');

        return session;
    } catch (error) {
        console.log('error signOut', error);
        throw new Error(error);
    }
};

export const getFilePreview = async (fileId, type) => {
    let fileUrl;

    try {
        if (type === 'video') {
            fileUrl = storage.getFileView(storageId, fileId);
        } else if (type === 'image') {
            fileUrl = storage.getFilePreview(storageId, fileId, 2000, 2000, 'top', 100);
        } else {
            throw new Error('Invalid file type');
        }

        if (!fileUrl) throw Error;

        return fileUrl;
    } catch (error) {
        console.log('error getFilePreview', error);
        throw new Error(error);
    }
};

export const uploadFile = async (file, type) => {
    if (!file) return;

    const asset = {
        name: file.fileName,
        type: file.mimeType,
        size: file.fileSize,
        uri: file.uri
    };

    try {
        const uploadedFile = await storage.createFile(storageId, ID.unique(), asset);

        const fileUrl = await getFilePreview(uploadedFile.$id, type);
        return fileUrl;
    } catch (error) {
        console.log('error uploadFile', error);
        throw new Error(error);
    }
};
export const createVideo = async (form) => {
    try {
        const [thumbnailUrl, videoUrl] = await Promise.all([uploadFile(form.thumbnail, 'image'), uploadFile(form.video, 'video')]);

        const newPost = await databases.createDocument(databaseId, videoCollectionId, ID.unique(), {
            title: form.title,
            thumbnail: thumbnailUrl,
            video: videoUrl,
            prompt: form.prompt,
            creator: form.userId
        });

        return newPost;
    } catch (error) {
        console.log('error createVideo', error);
        throw new Error(error);
    }
};

export const saveUnsaveVideo = async ({ userId, videoId, save }) => {
    try {
        const video = await databases.getDocument(databaseId, videoCollectionId, videoId);
        if (save) video.savedBy.push(userId);
        else video.savedBy.pop(userId);

        const result = await databases.updateDocument(databaseId, videoCollectionId, videoId, { savedBy: video.savedBy });
        if (result) return true;
        else return false;
    } catch (error) {
        console.log('error saveUnsaveVideo', error);
        throw new Error(error);
    }
};
