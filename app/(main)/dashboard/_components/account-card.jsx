"use client";

import { updateDefaultAccount } from '@/action/accounts';
import useFetch from '@/app/hooks/use-fetch';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/card';
import { Switch } from '@/components/switch';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect } from 'react'
import { toast } from 'sonner';

const AccountCard = ({ account }) => {
    const { name, type, balance, id, isDefault } = account;

    const {
        loading: updateDefaultLoading,
        fn: updateDefaultFn,
        data: updatedAccount,
        error,
    } = useFetch(updateDefaultAccount);



    const handleDefaultChange = async (event) => {
        event.preventDefault();

        if (isDefault) {
            toast.warn("You need atleast 1 default account");
            return; //don't allow toggling off the default account
        }

        await updateDefaultFn(id);

    };
    useEffect(() => {
        if (updatedAccount?.success) {
            toast.success("Default account updated successfully");
        }
    }, [updatedAccount]);

    useEffect(() => {
        if (error) {
            toast.error(error.message || "Failed to update default account");
        }
    }, [error]);



    return (
        <Card className="hover:shadow-lg and transition-shadow group relative p-4">
            <Link href={`/account/${id}`}>

                <CardHeader className="flex flex-row items-center justify-between space-y-1 pb-2">
                    <CardTitle className="text-sm font-medium captitalize">{name}</CardTitle>
                    <Switch
                        checked={isDefault}
                        onChange={handleDefaultChange}
                        disabled={updateDefaultLoading}
                    />
                </CardHeader>
                <CardContent>
                    <div className='text-2xl font-bold'>
                        ${parseFloat(balance).toFixed(2)}

                    </div>
                    <p className='text-xs text-muted-foreground capitalize'>
                        {type.charAt(0) + type.slice(1).toLowerCase()} Account
                    </p>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 text-sm text-muted-foreground">
                    <div className='flex items-center'>
                        <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" /> Income

                    </div>
                    <div className='flex items-center'>
                        <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" /> Expense

                    </div>
                </CardFooter>
            </Link>
        </Card>

    );
};

export default AccountCard
