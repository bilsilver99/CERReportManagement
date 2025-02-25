import React, { useEffect, useState, useCallback } from "react";
import DataGrid, {
  Column,
  Paging,
  Pager,
  Editing,
  SearchPanel,
  Toolbar,
  Item,
  FilterRow,
  HeaderFilter,
} from "devextreme-react/data-grid";
import Swal from "sweetalert2";
import { useAuth } from "../../contexts/auth";
import { UpdateUserCompany } from "./userCompanydata";
import axios from "axios";

const UserCompanyx = ({ companyCode, administrator }) => {
  const [userOptions, setUserOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyShortCode, setCompanyShortCode] = useState([]);

  // Create a ref to access the grid instance if needed.
  // (Not used here directly for the add button, but useful if you want to call addRow programmatically.)
  const gridRef = React.useRef(null);

  // Fetch user options for the FINEUSERID lookup
  const fetchUserOptions = useCallback(async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/get-user-company"
      );
      setUserOptions(response.data);
    } catch (error) {
      console.error("Error fetching FINEUSERID options:", error);
    }
  }, []);

  // Fetch company options for the COMPID lookup
  const fetchCompanyOptions = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-companies");
      setCompanyOptions(response.data);
    } catch (error) {
      console.error("Error fetching company options:", error);
    }
  }, []);

  // Fetch company short codes (with fields: CompId and ShortCode)
  const fetchCompanyShort = useCallback(async () => {
    try {
      const response = await axios.get("http://localhost:5000/get-user-short");
      setCompanyShortCode(response.data);
    } catch (error) {
      console.error("Error fetching company short codes:", error);
    }
  }, []);

  const fetchAllOptions = useCallback(() => {
    fetchUserOptions();
    fetchCompanyOptions();
    fetchCompanyShort();
  }, [fetchUserOptions, fetchCompanyOptions, fetchCompanyShort]);

  useEffect(() => {
    fetchAllOptions();
  }, [fetchAllOptions]);

  // Custom row validation
  const handleRowValidating = (e) => {
    const newFineUserId =
      e.newData.FINEUSERID !== undefined
        ? e.newData.FINEUSERID
        : e.oldData?.FINEUSERID;
    const newCompId =
      e.newData.COMPID !== undefined ? e.newData.COMPID : e.oldData?.COMPID;

    if (newFineUserId && newCompId) {
      const gridData = e.component.getDataSource().items();
      const duplicate = gridData.find((item) => {
        if (e.key) {
          return (
            item.FINEUSERID === newFineUserId &&
            item.COMPID === newCompId &&
            item.UNIQUEID !== e.key
          );
        }
        return item.FINEUSERID === newFineUserId && item.COMPID === newCompId;
      });
      if (duplicate) {
        Swal.fire({
          icon: "error",
          title: "Duplicate Entry",
          text: "User/Company already defined",
        });
        e.error = true;
        e.message = "User/Company already defined";
        e.isValid = false;
        e.cancel = true;
      }
    }
  };

  // When COMPID is set, update the dependent fields.
  const setCompIdCellValue = (rowData, value) => {
    rowData.COMPID = value;
    const comp = companyOptions.find((c) => c.company === value);
    rowData.COMPNAME = comp ? comp.name : "";
    const mapping = companyShortCode.find((cs) => cs.CompId === value);
    rowData.COMPSHORT = mapping ? mapping.ShortCode : "";
  };

  return (
    <div className="content-block dx-card responsive-paddings">
      <DataGrid
        ref={gridRef}
        dataSource={UpdateUserCompany(companyCode)}
        showBorders={true}
        remoteOperations={false}
        key="UNIQUEID"
        onRowValidating={handleRowValidating}
        onRowInserted={fetchAllOptions}
        onRowUpdated={fetchAllOptions}
        onRowRemoved={fetchAllOptions}
        //width={"60%"}
      >
        <SearchPanel visible={true} width={240} placeholder="Search..." />
        <FilterRow visible={true} applyFilter="auto" />
        <HeaderFilter visible={true} />
        <Paging enabled={true} />
        {/* Use row editing for cleaner cross‑field validation */}
        <Editing
          mode="row"
          allowUpdating={true}
          allowAdding={true}
          allowDeleting={true}
        />

        {/* Custom Toolbar for adding record */}
        <Toolbar>
          <Item
            location="before"
            widget="dxButton"
            options={{
              icon: "add", // You can change to any icon name or custom icon
              text: "Add New User/Company Option",
              stylingMode: "contained",
              onClick: () => {
                gridRef.current.instance.addRow();
              },
            }}
          />
        </Toolbar>

        <Column dataField="UNIQUEID" allowEditing={false} visible={false} />
        <Column
          dataField="FINEUSERID"
          caption="User"
          isrequired={true}
          lookup={{
            dataSource: userOptions,
            valueExpr: "FineUserID",
            displayExpr: "FineUserID",
          }}
          editorOptions={{
            acceptCustomValue: true,
            onCustomItemCreating: (e) => {
              const newItem = { FineUserID: e.text };
              setUserOptions((prev) => [...prev, newItem]);
              e.customItem = newItem;
            },
          }}
        />
        <Column
          dataField="COMPID"
          caption="Comp ID"
          isrequired={true}
          lookup={{
            dataSource: companyOptions,
            valueExpr: "company",
            displayExpr: "company",
          }}
          setCellValue={setCompIdCellValue}
        />
        <Column dataField="COMPNAME" caption="Comp Name" allowEditing={false} />
        <Column dataField="COMPSHORT" caption="Comp Short" />
        <Column
          dataField="DEFAULTCOMP"
          caption="Default Comp"
          dataType="boolean"
        />
        <Paging defaultPageSize={24} />
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
