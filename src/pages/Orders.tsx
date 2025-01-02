import { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { useAppSelector, useAppDispatch } from "../store/hooks/hooks";
import { Fragment } from "react";
import { fetchOrdersByPhone } from "../store/slices/ordersSlice";
import axios from "axios";
import { apiUrl } from "../Layout";
import BillComponent from "../components/BillComponent";
import html2pdf from "html2pdf.js";
import ReactDOMServer from "react-dom/server";

const Orders = () => {
  const { orders } = useAppSelector((state) => state.orders);
  const dispatch = useAppDispatch();
  const { notifications } = useAppSelector(state => state.notifications)
  const {firstName, lastName} = useAppSelector(state=>state.auth)


  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [completedCurrentPage, setCompletedCurrentPage] = useState(1);
  const ordersPerPage = 5;
  const { phone } = useAppSelector(state => state.auth)

  // Fetch orders on mount or userId change
  useEffect(() => {
    if (phone) {
      dispatch(fetchOrdersByPhone(phone));
    }
  }, [phone, dispatch, notifications]);

  // Filter orders into pending and completed
  const pendingOrders = orders.filter((order: any) => order.status === "pending");
  const completedOrders = orders.filter((order: any) => order.status === "completed");

  // Pagination Logic
  const getPaginatedOrders = (orders: any, page: number) => {
    const startIndex = (page - 1) * ordersPerPage;
    return orders.slice(startIndex, startIndex + ordersPerPage);
  };

  const paginatedPendingOrders = getPaginatedOrders(pendingOrders, pendingCurrentPage);
  const paginatedCompletedOrders = getPaginatedOrders(completedOrders, completedCurrentPage);

  const pendingTotalPages = Math.ceil(pendingOrders.length / ordersPerPage);
  const completedTotalPages = Math.ceil(completedOrders.length / ordersPerPage);

  const renderOrderList = (orderList: any, title: string) => (
    <>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>
      {orderList.map((order: any) => {
        const {
          orderId,
          status,
          items,
          totalPrice,
          completedAt,
          orderedAt,
          cabinName,
          specialInstructions,
          extraInfo,
        } = order;


        // const { cabinName, extraInfo, specialInstructions } = addressDetails || {};

        return (
          <Paper
            key={orderId}
            sx={{
              padding: 2,
              marginBottom: 2,
              boxShadow: 3,
              borderLeft: `6px solid ${status === "pending"
                  ? "orange"
                  : status === "completed"
                    ? "green"
                    : "red"
                }`,
            }}
          >
            <Typography variant="body1">
              <strong>Order ID:</strong> {orderId}
            </Typography>
            <Typography variant="body1">
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color:
                    status === "pending"
                      ? "orange"
                      : status === "completed"
                        ? "green"
                        : "red",
                }}
              >
                {status.toUpperCase()}
              </span>
            </Typography>
            <Typography variant="body1">
              <strong>Cabin:</strong> {cabinName || "N/A"}
            </Typography>
            {extraInfo && (
              <Typography variant="body2" color="textSecondary">
                <strong>Extra Info:</strong> {extraInfo}
              </Typography>
            )}
            {specialInstructions && (
              <Typography variant="body2" color="textSecondary">
                <strong>Special Instructions:</strong> {specialInstructions}
              </Typography>
            )}
            <Typography variant="body1">
              <strong>Total Price:</strong> ₹{totalPrice || 0}
            </Typography>
            <Typography variant="body1">
              <strong>
                {status === "completed"
                  ? "Completed At:"
                  : status === "pending"
                    ? "Ordered At:"
                    : "Cancelled At:"}
              </strong>{" "}
              {new Date(status === "completed" ? completedAt! : orderedAt!).toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={{ fontWeight: "bold", marginTop: 2 }}>
              Items:
            </Typography>
            <List>
              {items.map((item: any) => (
                <Fragment key={item._id}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.name} (x${item.quantity})`}
                      secondary={`Price: ₹${item.price}`}
                    />
                  </ListItem>
                  <Divider />
                </Fragment>
              ))}
            </List>
            <Button
              onClick={async () => {
                const billData = await axios.get(`${apiUrl}/payments/${orderId}`)
                const handleDownload = () => {
                  // Render BillComponent to a string
                  const content = ReactDOMServer.renderToString(<BillComponent billData={billData.data} items={items} userName={`${firstName} ${lastName}`}/>);
                  
                  // Create a temporary DOM container
                  const tempDiv = document.createElement("div");
                  tempDiv.innerHTML = content;
                  document.body.appendChild(tempDiv); // Append temporarily to DOM
              
                  const options = {
                    margin: 1,
                    filename: `bill_${billData.data.order_id}.pdf`,
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
                  };
              
                  html2pdf()
                    .set(options)
                    .from(tempDiv)
                    .save()
                    .then(() => {
                      document.body.removeChild(tempDiv); // Clean up temporary container
                    });
                };
                handleDownload()

              }}
            >Download bill</Button>

          </Paper>
        );
      })}
    </>
  );



  return (
    <Box sx={{ padding: "20px", maxWidth: "1200px", margin: "auto" }}>
      <Typography variant="h4" gutterBottom>
        All Orders
      </Typography>
      {renderOrderList(paginatedPendingOrders, "Pending Orders")}
      {pendingOrders.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setPendingCurrentPage((prev) => prev - 1)}
            disabled={pendingCurrentPage === 1}
          >
            Previous
          </Button>
          <Typography>
            Page {pendingCurrentPage} of {pendingTotalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setPendingCurrentPage((prev) => prev + 1)}
            disabled={pendingCurrentPage === pendingTotalPages}
          >
            Next
          </Button>
        </Box>
      )}
      {renderOrderList(paginatedCompletedOrders, "Completed Orders")}
      {completedOrders.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={() => setCompletedCurrentPage((prev) => prev - 1)}
            disabled={completedCurrentPage === 1}
          >
            Previous
          </Button>
          <Typography>
            Page {completedCurrentPage} of {completedTotalPages}
          </Typography>
          <Button
            variant="outlined"
            onClick={() => setCompletedCurrentPage((prev) => prev + 1)}
            disabled={completedCurrentPage === completedTotalPages}
          >
            Next
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Orders;