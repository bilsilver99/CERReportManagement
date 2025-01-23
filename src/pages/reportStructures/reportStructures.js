import React, { useEffect, useState, useCallback, useRef } from "react";
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  FilterRow,
  HeaderFilter,
  SearchPanel,
  Lookup,
  Item,
  Form,
  Selection,
  Toolbar,
  ColumnChooser,
} from "devextreme-react/data-grid";
import { useAuth } from "../../contexts/auth";

const ReportStructuresx = ({ companyCode, administrator }) => {
  return <div></div>;
};

export default function ReportStructures() {
  const { user } = useAuth();
  return (
    <ReportStructuresx
      companyCode={user.companynumber}
      administrator={user.administrator}
    />
  );
}
