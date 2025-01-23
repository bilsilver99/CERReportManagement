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
import { UpdateUserCompany } from "./userCompanydata";

const UserCompanyx = ({ companyCode, administrator }) => {
  //const [databaseNamesStore, setdatabaseNamesStore] = useState(null);

  // useEffect(() => {
  //   // if (companyCode) {
  //   const store = UpdateUserCompany();
  //   setdatabaseNamesStore(store);
  //   // }
  // }, []);

  return (
    <div className="content-block dx-card responsive-paddings">
      <DataGrid
        dataSource={UpdateUserCompany(companyCode)}
        showBorders={true}
        remoteOperations={false}
        key="UNIQUEID"
        //onEditingStart={handleEditingStart}
      >
        <SearchPanel visible={true} width={240} placeholder="Search..." />
        <Paging enabled={true} />
        <Editing
          mode="cell"
          allowUpdating={false}
          allowAdding={true}
          allowDeleting={true}
        />
        <Column dataField="UNIQUEID" allowEditing={false} visible={true} />
        <Column dataField="FINEUSERID" caption="User " />
        <Column dataField="COMPID" caption="Comp ID" />
        <Column dataField="COMPNAME" caption="Comp Name" />
        <Column dataField="COMPSHORT" caption="Comp Short" />
        <Column dataField="DEFAULTCOMP" caption="Default Comp" />
        <Paging defaultPageSize={8} />
        <Pager showPageSizeSelector={true} />
      </DataGrid>
    </div>
  );
};

export default function UserCompany() {
  const { user } = useAuth();
  return (
    <UserCompanyx
      companyCode={user.companynumber}
      administrator={user.administrator}
    />
  );
}
