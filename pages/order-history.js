import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import NextLink from "next/link";
import React, { useEffect, useContext, useReducer } from "react";
import {
  CircularProgress,
  Grid,
  List,
  ListItem,
  TableContainer,
  Typography,
  Card,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  ListItemText,
} from "@material-ui/core";
import { getError } from "../utils/error";
import { Store } from "../utils/Store";
import Layout from "../components/Layout";
import useStyles from "../utils/styles";
import moment from "jalali-moment";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, orders: action.payload, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    default:
      state;
  }
}

function OrderHistory() {
  const { state } = useContext(Store);
  const router = useRouter();
  const classes = useStyles();
  const { userInfo } = state;

  const [{ loading, error, orders }, dispatch] = useReducer(reducer, {
    loading: true,
    orders: [],
    error: "",
  });

  useEffect(() => {
    if (!userInfo) {
      router.push("/login");
    }
    const fetchOrders = async () => {
      try {
        dispatch({ type: "FETCH_REQUEST" });
        const { data } = await axios.get(`/api/orders/history`, {
          headers: { authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: "FETCH_SUCCESS", payload: data });
      } catch (err) {
        dispatch({ type: "FETCH_FAIL", payload: getError(err) });
      }
    };
    fetchOrders();
  }, []);
  return (
    <Layout title="Order History">
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/profile" passHref>
                <ListItem button component="a">
                  <ListItemText primary="پروفایل کاربر"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/order-history" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="تاریخچه سفارشات"></ListItemText>
                </ListItem>
              </NextLink>
            </List>
          </Card>
        </Grid>
        <Grid item md={9} xs={12}>
          <Card className={classes.section}>
            <List>
              <ListItem>
                <Typography component="h1" variant="h1">
                  تاریخچه سفارش ها
                </Typography>
              </ListItem>
              <ListItem>
                {loading ? (
                  <CircularProgress />
                ) : error ? (
                  <Typography className={classes.error}>{error}</Typography>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>ایدی</TableCell>
                          <TableCell>تاریخ</TableCell>
                          <TableCell>تعداد</TableCell>
                          <TableCell>پرداخت</TableCell>
                          <TableCell>ارسال</TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((order) => (
                          <TableRow key={order._id}>
                            <TableCell>{order._id.substring(20, 24)}</TableCell>
                            <TableCell>
                              {moment(order.createdAt)
                                .locale("fa")
                                .format("YYYY/MM/DD")}
                            </TableCell>
                            <TableCell>تومان {order.totalPrice}</TableCell>
                            <TableCell>
                              {order.isPaid
                                ? `پرداخت شده  ${order.paidAt}`
                                : "پرداخت نشده"}
                            </TableCell>
                            <TableCell>
                              {order.isDelivered
                                ? `ارسال در  ${order.deliveredAt}`
                                : "ارسال نشده"}
                            </TableCell>
                            <TableCell>
                              <NextLink href={`/order/${order._id}`} passHref>
                                <Button variant="contained">جزییات</Button>
                              </NextLink>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export default dynamic(() => Promise.resolve(OrderHistory), { ssr: false });
