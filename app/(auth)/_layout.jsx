import { View, Text } from 'react-native';
import React from 'react';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Loader from '@/components/Loader';
import { useGlobalContext } from '@/context/GlobalProvider';

const AuthLayout = () => {
    const { isLoading, isLogged } = useGlobalContext();

    if (!isLoading && isLogged) return <Redirect href="/home" />;

    return (
        <>
            <Stack>
                <Stack.Screen
                    name="sign-in"
                    options={{
                        headerShown: false
                    }}
                />
                <Stack.Screen
                    name="sign-up"
                    options={{
                        headerShown: false
                    }}
                />
            </Stack>

            <Loader isLoading={isLoading} />
            <StatusBar backgroundColor="#161622" style="light" />
        </>
    );
};

export default AuthLayout;
