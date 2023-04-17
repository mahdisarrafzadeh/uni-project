import {
  List,
  ListItem,
  Typography,
  TextField,
  Button,
} from "@material-ui/core";
import { useRouter } from "next/router";
import React, { useContext, useEffect } from "react";
import Layout from "../components/Layout";
import { Store } from "../utils/Store";
import useStyles from "../utils/styles";
import Cookies from "js-cookie";
import { Controller, useForm } from "react-hook-form";
import CheckoutWizard from "../components/CheckoutWizard";

export default function Shipping() {
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    getValues,
  } = useForm();
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const {
    userInfo,
    cart: { shippingAddress },
  } = state;
  const { location } = shippingAddress;
  useEffect(() => {
    if (!userInfo) {
      router.push("/login?redirect=/shipping");
    }
    setValue("fullName", shippingAddress.fullName);
    setValue("address", shippingAddress.address);
    setValue("city", shippingAddress.city);
    setValue("postalCode", shippingAddress.postalCode);
  }, []);

  const classes = useStyles();
  const submitHandler = ({ fullName, address, city, postalCode }) => {
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: { fullName, address, city, postalCode, location },
    });
    Cookies.set("shippingAddress", {
      fullName,
      address,
      city,
      postalCode,
      location,
    });
    router.push("/payment");
  };

  const chooseLocationHandler = () => {
    const fullName = getValues("fullName");
    const address = getValues("address");
    const city = getValues("city");
    const postalCode = getValues("postalCode");
    dispatch({
      type: "SAVE_SHIPPING_ADDRESS",
      payload: { fullName, address, city, postalCode },
    });
    Cookies.set("shippingAddress", {
      fullName,
      address,
      city,
      postalCode,
      location,
    });
    router.push("/map");
  };
  return (
    <Layout title="ادرس تحویل">
      <CheckoutWizard activeStep={1} />
      <form onSubmit={handleSubmit(submitHandler)} className={classes.form}>
        <Typography component="h1" variant="h1">
          ادرس تحویل
        </Typography>
        <List>
          <ListItem>
            <Controller
              name="fullName"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="fullName"
                  label="نام و نام خانوادگی"
                  error={Boolean(errors.fullName)}
                  helperText={
                    errors.fullName
                      ? errors.fullName.type === "minLength"
                        ? ""
                        : "نام خانوادکی خود را وارد کنید"
                      : ""
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>
          <ListItem>
            <Controller
              name="address"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="address"
                  label="ادرس"
                  error={Boolean(errors.address)}
                  helperText={
                    errors.address
                      ? errors.address.type === "minLength"
                        ? ""
                        : "وارد کردن ادرس الزامی میباشد"
                      : ""
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>
          <ListItem>
            <Controller
              name="city"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="city"
                  label="شهر"
                  error={Boolean(errors.city)}
                  helperText={
                    errors.city
                      ? errors.city.type === "minLength"
                        ? ""
                        : "وارد کردن شهر الزامی میباشد"
                      : ""
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>
          <ListItem>
            <Controller
              name="postalCode"
              control={control}
              defaultValue=""
              rules={{
                required: true,
                minLength: 2,
              }}
              render={({ field }) => (
                <TextField
                  variant="outlined"
                  fullWidth
                  id="postalCode"
                  label="کد پستی"
                  error={Boolean(errors.postalCode)}
                  helperText={
                    errors.postalCode
                      ? errors.postalCode.type === "minLength"
                        ? ""
                        : "وارد کردن کد پستی الزامی میباشد"
                      : ""
                  }
                  {...field}
                ></TextField>
              )}
            ></Controller>
          </ListItem>
          <ListItem>
            <Button variant="contained" type="submit" fullWidth color="primary">
              ادامه
            </Button>
          </ListItem>
        </List>
      </form>
    </Layout>
  );
}
