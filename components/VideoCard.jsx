import { View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { icons } from '@/constants';
import { ResizeMode, Video } from 'expo-av';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { saveUnsaveVideo } from '@/lib/appwrite';
import { useGlobalContext } from '@/context/GlobalProvider';

const VideoCard = ({
    video: {
        $id,
        title,
        thumbnail,
        video,
        creator: { username, avatar },
        savedBy
    },
    savedPost
}) => {
    const { user } = useGlobalContext();
    const [play, setPlay] = useState(false);
    const [saved, setSaved] = useState(savedPost ? savedPost : savedBy.find((savedUser) => savedUser.$id === user.$id));

    const handleSave = async () => {
        try {
            setSaved(!saved);
            const success = await saveUnsaveVideo({ userId: user.$id, videoId: $id, save: !saved });
            if (!success) {
                Alert.alert('Error', 'Could not save video');
                setSaved(saved);
            }
        } catch (error) {
            Alert.alert('Error', `Could not ${!saved ? 'save' : 'unsave'} video`);
        }
    };

    return (
        <View className="flex-col items-center px-4 mb-14">
            <View className="flex-row gap-3 items-start">
                <View className="justify-center items-center flex-row flex-1">
                    <View className="w-[46px] h-[46px] rounded-lg border border-secondary justify-center items-center p-0.5">
                        <Image source={{ uri: avatar }} className="w-full h-full rounded-lg" resizeMode="cover" />
                    </View>
                    <View className="justify-center flex-1 ml-3 gap-y-1">
                        <Text className="text-white font-psemibold text-sm" numberOfLines={1}>
                            {title}
                        </Text>
                        <Text className="text-xs text-gray-100 font-pregular">{username}</Text>
                    </View>
                </View>
                <TouchableOpacity className="pt-2" onPress={() => handleSave()}>
                    {/* <Image source={icons.menu} className="w-5 h-5" resizeMode="contain" /> */}
                    <FontAwesomeIcon
                        size={25}
                        icon={saved ? icons.FaSolidIcons.faBookmark : icons.FaRegularIcons.faBookmark}
                        color="white"
                    />
                </TouchableOpacity>
            </View>

            {play ? (
                <Video
                    source={{ uri: video }}
                    className="w-full h-60 rounded-xl mt-3"
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls
                    shouldPlay
                    onPlaybackStatusUpdate={(status) => {
                        if (status.didJustFinish) {
                            setPlay(false);
                        }
                    }}
                    onError={(error) => {
                        Alert.alert('Error', 'Could not load video');
                    }}
                />
            ) : (
                <TouchableOpacity
                    className="w-full h-60 rounded-xl mt-3 relative justify-center items-center"
                    activeOpacity={0.7}
                    onPress={() => setPlay(true)}
                >
                    <Image source={{ uri: thumbnail }} className="w-full h-full rounded-xl mt-3" resizeMode="cover" />
                    <Image source={icons.play} className="w-12 h-12 absolute" resizeMode="contain" />
                </TouchableOpacity>
            )}
        </View>
    );
};

export default VideoCard;
