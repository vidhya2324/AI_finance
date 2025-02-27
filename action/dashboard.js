"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";



const serializetrancsaction = (obj) => {
    const serialized = { ...obj };



    if (obj.balance) {
        serialized.balance = obj.balance.toNumber();
    }
    if (obj.amount) {
        serialized.amount = obj.amount.toNumber();
    }
    return serialized;
}
export async function createAccount(data) {
    try {
        const { userId } = await auth();
        if (!userId) throw new Error("Unauthorized");


        const user = await db.user.findUnique({
            where: { clerkUserId: userId },

        });

        if (!user) {
            throw new Error("User not found");
        }

        //convert balance to float before saving
        const balanceFloat = parseFloat(data.balance);
        if (isNaN(balanceFloat)) {
            throw new Error("Invalid Balance amount");

        }


        //check if this is the user's first account
        const existingAccounts = await db.account.findMany({
            where: { userId: user.id },
        });

        const shouldBeDefault = existingAccounts.length === 0 ? true : data.isDefault;


        // If this account should be default, unset other default accounts
        if (shouldBeDefault) {
            await db.account.updateMany({
                where: { userId: username.id, isDefault: true },
                data: { isDefault: false },

            });


        }


        const account = await db.account.update({
            data: {
                ...data,
                balance: balanceFloat,
                userId: user.id,
                isDefault: shouldBeDefault,
            },
        });


        const serializedAccount = serializetrancsaction(account); //now convert the balance into number..so create const serializetrancsaction.



        revalidatePath("/dashboard");
        return { success: true, data: serializedAccount };


    } catch (error) {
        throw new Error(error.message);
    }
}

export async function getUserAccounts() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");


    const user = await db.user.findUnique({
        where: { clerkUserId: userId },

    });

    if (!user) {
        throw new Error("User not found");
    }

    const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            transactions: {
                select: {
                    category: true, // Ensuring only the category field is fetched
                },
            },
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    });


    /* const accounts = await db.account.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
            _count: {
                select: {
                    transactions: true,
                },
            },
        },
    }); */

    const serializedAccount = accounts.map(serializetrancsaction); //now convert the balance into number..so create const serializetrancsaction.

    return serializedAccount;
}

export async function getDashboardData(){
    const {userId} = await auth();
    if(!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: {clerkUserId: userId},
    });

    if(!user) {
        throw new Error("User not found");
    }

    //Get all user transactions
    const transactions = await db.transaction.findMany({
        where: {userId: user.id},
        orderBy: {date: "desc"},
    });

    return transactions.map(serializetrancsaction); 
}