"use client";


import { Badge } from '@/components/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { categoryColors } from '@/data/categories';
import { Checkbox } from "@/components/checkbox";
import { format } from 'date-fns';
import { ChevronDown, ChevronUp, Clock, MoreHorizontal, Search, Trash, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react'
import { Input } from '@/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/select';
//import { Switch } from '@radix-ui/react-switch';
import { toast } from 'sonner';
import { BarLoader } from 'react-spinners';
import useFetch from '@/app/hooks/use-fetch';
import { bulkDeleteTransactions } from '@/action/accounts';
import { useEffect } from "react";

import { Switch } from '@/components/switch';

const RECURRING_INTERNALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

const TransactionTable = ({ transactions }) => {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({
    field: "date",
    direction: "desc",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  
  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleted,
  } = useFetch(bulkDeleteTransactions);


  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];

    //Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((transactions) =>
        transactions.description?.toLowerCase().includes(searchLower)
      );
    }

    //Apply recurring filter
    if (recurringFilter) {
      result = result.filter((transactions) => {
        if (recurringFilter === "recurring only") return transactions.isRecurring;
        return !transactions.isRecurring;
      });
    }

    //sorting the transaction
    result.sort((a, b) => {
      let comparison = 0

      switch (sortConfig.field) {
        case "date":
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "category":
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = 0;

      }

      return sortConfig.direction == "asc" ? comparison : -comparison;
    }
    );
    return result;
  }, [
    transactions, searchTerm, typeFilter, recurringFilter, sortConfig,
  ]);



  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction:
        current.field == field && current.direction == "asc" ? "desc" : "asc",
    }));

  };
  const handleSelect = (id) => {
    setSelectedIds((current) =>

      current.includes(id)
        ? current.filter((item) => item != id) : [...current, id]
    );

  };
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === filteredAndSortedTransactions.length
        ? []
        : filteredAndSortedTransactions.map((t) => t.id)
    );
  };

 
  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedIds.length} transactions?`
      )
) {
      return;
    }

    deleteFn(selectedIds);
  }; 

  

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully"); 
      router.refresh();
    }
  }, [deleted, deleteLoading]);




  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setSelectedIds([]);

  };



  return (
    <div className='space-y-4'>
      {deleteLoading && (
        <BarLoader className="mt-4" width={"100%"} color="#9333ea" />
      )}

      {/* Filter */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className="relative flex-1">
          <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className='flex gap-2'>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>


          <Select value={recurringFilter} onValueChange={(value) => setRecurringFilter(value)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="All Transactions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recurring only">recurring only</SelectItem>
              <SelectItem value="Non-recurring only">Non-recurring only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <div className='flex items-center gap-2'>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}>

                <Trash className="h-4 w-4 mr-2" />
                Deleted Selected({selectedIds.length})
              </Button>
            </div>

          )}
          {(searchTerm || typeFilter || recurringFilter) && (
            <Button
              variant="outline"
              size="icon"
              onClick={handleClearFilters}
              title="Clear Filters">

              <X className="h-4 w-5" />
            </Button>
          )}

        </div>
      </div>



      {/* Transactions */}
      <div className='rounded-mb border'>

        <Table>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">

                <div>

                  <Checkbox
                    checked={
                      selectedIds.length ===
                      filteredAndSortedTransactions.length &&
                      filteredAndSortedTransactions.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("date")}
              >
                <div className='flex items-center gap-1'>
                  Date{" "}
                  {sortConfig.field === "date" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className='ml-1 h-4 w-4' />
                    ))
                  }
                </div>
              </TableHead>

              <TableHead
                className="cursor-pointer"
                onClick={() => handleSort("description")}
              >
                <div className='flex items-center gap-1'>
                  Description{" "}
                  {sortConfig.field === "description" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className='ml-1 h-4 w-4' />
                    ))
                  }
                </div>
              </TableHead>

              <TableHead
                className="text-center flex justify-center"
                onClick={() => handleSort("category")}
              >
                <div className='flex items-center gap-1'>
                  Category
                  {sortConfig.field === "category" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className='ml-1 h-4 w-4' />
                    ))
                  }
                </div>

              </TableHead>
              <TableHead
                className=" text-right w-[150px] cursor-pointer"
                onClick={() => handleSort("amount")}
              >
                <div className='flex items-center justify-end'>
                  Amount
                  {sortConfig.field === "amount" &&
                    (sortConfig.direction === "asc" ? (
                      <ChevronUp className="ml-1 h-4 w-4" />
                    ) : (
                      <ChevronDown className='ml-1 h-4 w-4' />
                    ))
                  }

                </div>

              </TableHead>
              <TableHead className=" text-center w-[120px]">
                Recurring
                {sortConfig.field === "recurring" &&
                  (sortConfig.direction === "asc" ? (
                    <ChevronUp className="ml-1 h-4 w-4" />
                  ) : (
                    <ChevronDown className='ml-1 h-4 w-4' />
                  ))
                }

              </TableHead>
              <TableHead className="w-[50px]" />

            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  No Transactions Found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedTransactions.map((transactions) => (
                <TableRow key={transactions.id}>
                  <TableCell >
                    <Checkbox
                      onCheckedChange={() => handleSelect(transactions.id)}
                      checked={selectedIds.includes(transactions.id)}
                    />
                  </TableCell>
                  <TableCell className="px-4 py-3">{format(new Date(transactions.date), "PP")}

                  </TableCell>
                  <TableCell >{transactions.description} </TableCell>
                  <TableCell className="flex justify-center items-center ">
                    <span
                      style={{
                        background: categoryColors[transactions.category], display: "inline-block",
                        padding: "4px 8px",
                        borderRadius: "4px",

                      }}
                      className=' px-2 py-1 rounded text-white text-sm'
                    >
                      {transactions.category}
                    </span>
                  </TableCell>


                  <TableCell className="text-right  w-[150px] px-4 py-3 font font-medium"
                    style={{
                      color: transactions.type === "EXPENSE" ? "red" : "green",
                    }}>
                    ${transactions.amount.toFixed(2)}

                  </TableCell>
                  <TableCell className="text-center">
                    {transactions.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <Badge variant="outline"
                              className="gap-1 bg-purple-100 text-purple-700 hover:bg-purple-200">
                              <Clock className="h-4 w-4" />
                              {RECURRING_INTERNALS[
                                transactions.recurringInterval
                              ]
                              }
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className='text-sm'>
                              <div className='font-medium'>
                                Next Date:
                                <div>
                                  {
                                    format(new Date(transactions.nextRecurringDate), "PP")
                                  }

                                </div>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-4 w-4" />
                        One-time
                      </Badge>

                    )}
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(
                              `/transaction/create?edit=${transactions.id}`
                            )
                          }

                        >

                          Edit </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => deleteFn([transactions.id])}>


                          Delete
                        </DropdownMenuItem>

                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>


                </TableRow>

              ))

            )}

          </TableBody>
        </Table>
      </div>
    </div>
  )
};

export default TransactionTable;
