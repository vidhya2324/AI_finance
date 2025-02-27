import { getUserAccounts } from "@/action/dashboard";
import { defaultCategories } from "@/data/categories";
import React from "react";
import AddTransactionForm from "../_components/transaction-form";
import { getTransaction } from "@/action/transaction";

const AddTransactionPage = async ({ searchParams }) => {
  const params = await searchParams;
  const editId = params?.edit;
  const accounts = await getUserAccounts();

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8 text-center">
        {editId ? "Edit" : "Add"} Transaction
      </h1>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={!!editId}
        initialData={initialData}
      />
    </div>
  );
};

export default AddTransactionPage;
