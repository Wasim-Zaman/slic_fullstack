import React, { useEffect, useState } from "react";
import SideNav from "../../../components/Sidebar/SideNav";
import { useNavigate } from "react-router-dom";
import { purchaseOrderDetailsColumn, salesOrderColumn, salesOrderDetailsColumn } from "../../../utils/datatablesource";
import DataTable from "../../../components/Datatable/Datatable";
import { toast } from "react-toastify";
import newRequest from "../../../utils/userRequest";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import { Button } from "@mui/material";
import AddSalesOrderPopUp from "./AddSalesOrderPopUp";
import UpdateSalesOrderPopUp from "./UpdateSalesOrderPopUp";
import ErpTeamRequest from "../../../utils/ErpTeamRequest";

const SalesOrder = () => {
  const [data, setData] = useState([]);
  const memberDataString = sessionStorage.getItem("slicUserData");
  const memberData = JSON.parse(memberDataString);
  // console.log(memberData)
  const token = JSON.parse(sessionStorage.getItem("slicLoginToken"));

  const [isLoading, setIsLoading] = useState(true);
  const [secondGridData, setSecondGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]); // for the map markers
  const navigate = useNavigate();
  const [isSalesOrderDataLoading, setIsSalesOrderDataLoading] = useState(false);

      const fetchData = async () => {
        setIsLoading(true);
        try {
          // const response = await newRequest.get('/salesOrders/v1/all', {
          //   headers: {
          //     Authorization: `Bearer ${memberData?.data?.token}`,
          //   },
          // });
          // console.log(response.data);
          const res = await ErpTeamRequest.post(
            '/slicuat05api/v1/getApi',
            {
              "filter": {
                "P_SOH_DEL_LOCN_CODE": "FG102"
              },
              "M_COMP_CODE": "SLIC",
              "M_USER_ID": "SYSADMIN",
              "APICODE": "ListOfSO",
              "M_LANG_CODE": "ENG"
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          // console.log(res?.data);
          
          // Map the API response to the expected data structure
          const mappedData = res.data.map(item => ({
            HEAD_SYS_ID: item.ListOfSO.HEAD_SYS_ID,
            DEL_LOCN: item.ListOfSO.DEL_LOCN,
            SO_CUST_NAME: item.ListOfSO.SO_CUST_NAME,
            SO_LOCN_CODE: item.ListOfSO.SO_LOCN_CODE,
            SO_NUMBER: item.ListOfSO.SO_NUMBER,
            STATUS: item.ListOfSO.STATUS,
          }));

          setData(mappedData);
          setIsLoading(false);
        } catch (err) {
          console.log(err);
          setIsLoading(false);
          toast.error(err?.response?.data?.message || "Something Is Wrong");
      };
    }

    useEffect(() => {
    fetchData(); // Calling the function within useEffect, not inside itself
  }, []);


  const handleRowClickInParent = async (item) => {
    // console.log(item)
    if (item.length === 0) {
      setFilteredData(secondGridData);
      return;
    }
    const filteredData = secondGridData.filter((singleItem) => {
      return Number(singleItem?.ProvGLN) == Number(item[0]?.ProvGLN);
    });

    // call api
    setIsSalesOrderDataLoading(true);
    try {
      // const res = await newRequest.get(`/lineItems/v1/699}`, {
      // const res = await newRequest.get(`/lineItems/v1/${item[0]?.SO_NUMBER}`, {
      //   headers: {
      //     Authorization: `Bearer ${memberData?.data?.token}`,
      //   },
      // });
      // // console.log(res?.data)
      // const filteredData = res?.data?.data ?? [];
      const res = await ErpTeamRequest.post(
        '/slicuat05api/v1/getApi',
        {
          "filter": {
            "P_SOI_SOH_SYS_ID": item[0]?.Head_SYS_ID
            // "P_SOI_SOH_SYS_ID": "1835972"
          },
          "M_COMP_CODE": "SLIC",
          "M_USER_ID": "SYSADMIN",
          "APICODE": "ListOfSOItem",
          "M_LANG_CODE": "ENG"
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(res?.data);

      // Map the response data to the expected structure for the second grid
      const mappedData = res?.data.map(item => ({
        GRADE: item.ListOfSOItem.GRADE,
        ITEM_CODE: item.ListOfSOItem.ITEM_CODE,
        ITEM_NAME: item.ListOfSOItem.ITEM_NAME,
        ITEM_SYS_ID: item.ListOfSOItem.ITEM_SYS_ID,
        SO_QTY: item.ListOfSOItem.SO_QTY,
        INV_QTY: item.ListOfSOItem.INV_QTY,
        UOM: item.ListOfSOItem.UOM,
      }));

      setFilteredData(mappedData);
    } catch (error) {
      // console.log(error);
      toast.error(error?.response?.data?.message ||"Something went wrong");
      setFilteredData([]);
    } finally {
      setIsSalesOrderDataLoading(false);
    }
  };


  const [isCreatePopupVisible, setCreatePopupVisibility] = useState(false);
  const handleShowCreatePopup = () => {
    setCreatePopupVisibility(true);
  };


  const [isUpdatePopupVisible, setUpdatePopupVisibility] = useState(false);
  const handleShowUpdatePopup = (row) => {
    setUpdatePopupVisibility(true);
    // console.log(row)
    sessionStorage.setItem("updateSalesOrderData", JSON.stringify(row));
  };


  const handleDelete = (row) => {
    // console.log(row);
    Swal.fire({
      title: `${'Are you sure to delete this record?'}!`,
      text: `${'You will not be able to recover this Sales Order'}!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `${'Yes Delete'}!`,
      cancelButtonText: `${'No, keep it'}!`,
      confirmButtonColor: '#1E3B8B',
      cancelButtonColor: '#FF0032',
    }).then((result) => {
      if (result.isConfirmed) {
        const deletePromise = new Promise(async (resolve, reject) => {
          try {
            const response = await newRequest.delete("/salesOrders/v1/delete/" + row?.SO_NUMBER);
            if (response) {
              // await refetch();
              resolve(response?.data?.message || 'Products deleted successfully');
              const updatedData = data.filter(item => item.SO_NUMBER !== row.SO_NUMBER);
              setData(updatedData);
            } else {
              reject(new Error('Failed to delete product'));
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            reject(error);
          }
        });
  
        toast.promise(
          deletePromise,
          {
            pending: 'Deleting product...',
            success: {
              render({ data }) {
                return data;
              }
            },
            error: {
              render({ data }) {
                return data.message || 'Failed to delete product';
              }
            }
          }
        );
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        return;
      }
    });
  };


  return (
    <SideNav>
      <div
        className='p-3 h-full'
      >
        {/* <div
          className={`flex justify-start items-center flex-wrap gap-2 py-3 px-3`}
        >
          <Button
            variant="contained"
            onClick={handleShowCreatePopup}
            style={{ backgroundColor: "#CFDDE0", color: "#1D2F90" }}
            // startIcon={<PiBarcodeDuotone />}
          >
            Add Sales Order
          </Button>
        </div> */}
        <div className="h-auto w-full shadow-xl">
          <div
            style={{
              marginLeft: "-11px",
              marginRight: "-11px",
            }}
          >
            <DataTable
              data={data}
              title={"Sales Order"}
              columnsName={salesOrderColumn}
              loading={isLoading}
              secondaryColor="secondary"
              checkboxSelection="disabled"
              handleRowClickInParent={handleRowClickInParent}
              actionColumnVisibility={false}
              dropDownOptions={[
                {
                  label: "Edit",
                  icon: (
                    <EditIcon
                      fontSize="small"
                      color="action"
                      style={{ color: "rgb(37 99 235)" }}
                    />
                  ),
                  action: handleShowUpdatePopup,
                },
                {
                  label: "Delete",
                  icon: (
                    <DeleteIcon
                      fontSize="small"
                      color="action"
                      style={{ color: "rgb(37 99 235)" }}
                    />
                  ),
                  action: handleDelete,
                },
              ]}
              uniqueId="salesOrderId"
            />
          </div>
        </div>

        <div style={{ marginLeft: "-11px", marginRight: "-11px" }}>
          <DataTable
            data={filteredData}
            title={"List Of Sales Order"}
            secondaryColor="secondary"
            columnsName={salesOrderDetailsColumn}
            backButton={true}
            checkboxSelection="disabled"
            actionColumnVisibility={false}
            // dropDownOptions={[
            //   {
            //     label: "Delete",
            //     icon: <DeleteIcon fontSize="small" style={{ color: '#FF0032' }} />
            //     ,
            //     action: handleShipmentDelete,
            //   },
            // ]}
            uniqueId={"shipmentRequestProductId"}
            loading={isSalesOrderDataLoading}
          />
        </div>


        {isCreatePopupVisible && (
          <AddSalesOrderPopUp
            isVisible={isCreatePopupVisible}
            setVisibility={setCreatePopupVisibility}
            refreshGTINData={fetchData}
          />
        )}


        {isUpdatePopupVisible && (
          <UpdateSalesOrderPopUp
            isVisible={isUpdatePopupVisible}
            setVisibility={setUpdatePopupVisibility}
            refreshGTINData={fetchData}
          />
        )}
      </div>
    </SideNav>
  );
};

export default SalesOrder;
