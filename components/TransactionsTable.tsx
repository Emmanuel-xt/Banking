import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatAmount, getTransactionStatus, removeSpecialCharacters } from "@/lib/utils";

const TransactionsTable = ({ transactions }: TransactionTableProps) => {
  return (
    <Table>
      <TableHeader className="bg-[#f9fafb]">
        <TableRow>
          <TableHead className="px-2 max-md:hidden">Transaction</TableHead>
          <TableHead className="px-2 max-md:hidden">Amount</TableHead>
          <TableHead className="px-2 max-md:hidden">Status</TableHead>
          <TableHead className="px-2 max-md:hidden">Date</TableHead>
          <TableHead className="px-2 max-md:hidden">Channel</TableHead>
          <TableHead className="px-2 max-md:hidden">Category</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions?.map((t: Transaction) => {
          const status = getTransactionStatus(new Date(t.date));
          const amount = formatAmount(t.amount);
          const isDebit = t.type === "debit";
          const isCredit = t.type === "credit";
          return (
            <TableRow key={t.id}>
              <TableCell>
                <div className="">
                  <h1 className="">{removeSpecialCharacters(t.name)}</h1>
                </div>
              </TableCell>
              
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;
