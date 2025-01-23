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

const MasterCalendarx = ({ companyCode, administrator }) => {
  return <div></div>;
};

export default function MasterCalendar() {
  const { user } = useAuth();
  return (
    <MasterCalendarx
      companyCode={user.companynumber}
      administrator={user.administrator}
    />
  );
}
