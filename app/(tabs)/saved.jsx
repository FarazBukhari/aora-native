import { View, Text, FlatList, ScrollView, RefreshControl } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import VideoCard from '@/components/VideoCard';
import useAppwrite from '@/lib/useAppwrite';
import { getSavedUserPosts } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';
import SearchInput from '@/components/SearchInput';
import EmptyState from '@/components/EmptyState';

const Saved = () => {
    const { user } = useGlobalContext();
    const { data: posts, refetch } = useAppwrite(() => getSavedUserPosts(user.$id));

    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);

        await refetch();

        setRefreshing(false);
    };
    return (
        <SafeAreaView className="bg-primary h-full">
            <FlatList
                data={posts}
                keyExtractor={(item) => item.$id}
                renderItem={({ item }) => <VideoCard video={item} saved={true} />}
                ListHeaderComponent={() => (
                    <View className="my-6 px-4 space-y-6">
                        <View className="justify-between items-start flex mb-6">
                            <Text className="text-2xl text-white font-psemibold">Saved Videos</Text>
                        </View>
                        <SearchInput placeholder="Search your saved videos" />
                    </View>
                )}
                ListEmptyComponent={() => (
                    <EmptyState title="No videos found" subtitle="When you save some videos, they will show up here" />
                )}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    );
};

export default Saved;
