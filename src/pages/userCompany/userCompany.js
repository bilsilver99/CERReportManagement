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
import axios from "axios";

const UserCompanyx = ({ companyCode, administrator }) => {
  const [userOptions, setUserOptions] = useState([]);

  useEffect(() => {
    const fetchUserOptions = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/get-user-company"
        );
        setUserOptions(response.data); // Set the options for FINEUSERID dropdown
      } catch (error) {
        console.error("Error fetching FINEUSERID options:", error);
      }
    };
    fetchUserOptions();
  }, []);

  useEffect(() => {
    console.log("user options are: ", userOptions);
  }, [userOptions]);
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
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
        />
        <Column dataField="UNIQUEID" allowEditing={false} visible={true} />
        <Column
          dataField="FINEUSERID"
          isrequired={true}
          caption="User"
          lookup={{
            dataSource: userOptions,
            valueExpr: "FineUserID",
            displayExpr: "FineUserID",
          }}
        />
        <Column dataField="COMPID" caption="Comp ID" isrequired={true} />
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
