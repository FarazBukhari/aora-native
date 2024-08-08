import { View, Dimensions, ActivityIndicator, Platform } from 'react-native';
import React from 'react';
// import AnimatedLoader from 'react-native-animated-loader';

const Loader = ({ isLoading }) => {
    const osName = Platform.OS;
    const screenHeight = Dimensions.get('screen').height;

    if (!isLoading) return null;

    return (
        <View className="absolute flex justify-center items-center w-full h-full bg-primary/60 z-10" style={{ height: screenHeight }}>
            {/* <AnimatedLoader visible={!isLoading} overlayColor="rgba(0,0,0,0.25)" animationStyle={style.lottie} speed={1} /> */}
            <ActivityIndicator animating={isLoading} color="#FF9C01" size={osName === 'ios' ? 'large' : 50} />
        </View>
    );
};
// const style = StyleSheet.create({
//     lottie: {
//         width: 100,
//         height: 100
//     }
// });

export default Loader;
