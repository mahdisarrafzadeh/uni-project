import axios from "axios";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import NextLink from "next/link";
import React, { useEffect, useContext, useReducer, useState } from "react";
import {
  Grid,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  ListItemText,
  TextField,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { getError } from "../../../utils/error";
import { Store } from "../../../utils/Store";
import Layout from "../../../components/Layout";
import useStyles from "../../../utils/styles";
import { Controller, useForm } from "react-hook-form";
import { useSnackbar } from "notistack";

function reducer(state, action) {
  switch (action.type) {
    case "FETCH_REQUEST":
      return { ...state, loading: true, error: "" };
    case "FETCH_SUCCESS":
      return { ...state, loading: false, error: "" };
    case "FETCH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_REQUEST":
      return { ...state, loadingUpdate: true, errorUpdate: "" };
    case "UPDATE_SUCCESS":
      return { ...state, loadingUpdate: false, errorUpdate: "" };
    case "UPDATE_FAIL":
      return { ...state, loadingUpdate: false, errorUpdate: action.payload };
    case "UPLOAD_REQUEST":
      return { ...state, loadingUpload: true, errorUpload: "" };
    case "UPLOAD_SUCCESS":
      return {
        ...state,
        loadingUpload: false,
        errorUpload: "",
      };
    case "UPLOAD_FAIL":
      return { ...state, loadingUpload: false, errorUpload: action.payload };

    default:
      return state;
  }
}

function ProductEdit({ params }) {
  const productId = params.id;
  const { state } = useContext(Store);
  const [{ loading, error, loadingUpdate, loadingUpload }, dispatch] =
    useReducer(reducer, {
      loading: true,
      error: "",
    });
  const {
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
  } = useForm();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const router = useRouter();
  const classes = useStyles();
  const { userInfo } = state;

  useEffect(() => {
    if (!userInfo) {
      return router.push("/login");
    } else {
      const fetchData = async () => {
        try {
          dispatch({ type: "FETCH_REQUEST" });
          const { data } = await axios.get(`/api/admin/products/${productId}`, {
            headers: { authorization: `Bearer ${userInfo.token}` },
          });
          dispatch({ type: "FETCH_SUCCESS" });
          setValue("name", data.name);
          setValue("slug", data.slug);
          setValue("price", data.price);
          setValue("image", data.image);
          setValue("featuredImage", data.featuredImage);
          setIsFeatured(data.isFeatured);
          setValue("category", data.category);
          setValue("brand", data.brand);
          setValue("countInStock", data.countInStock);
          setValue("description", data.description);
        } catch (err) {
          dispatch({ type: "FETCH_FAIL", payload: getError(err) });
        }
      };
      fetchData();
    }
  }, []);
  // const uploadHandler = async (e, imageField = "image") => {
  //   const file = e.target.files[0];
  //   const bodyFormData = new FormData();
  //   bodyFormData.append("file", file);
  //   try {
  //     dispatch({ type: "UPLOAD_REQUEST" });
  //     const { data } = await axios.post("/api/admin/upload", bodyFormData, {
  //       headers: {
  //         "Content-Type": "multipart/form-data",
  //         authorization: `Bearer ${userInfo.token}`,
  //       },
  //     });
  //     dispatch({ type: "UPLOAD_SUCCESS" });
  //     setValue(imageField, data.secure_url);
  //     enqueueSnackbar("File uploaded successfully", { variant: "success" });
  //   } catch (err) {
  //     dispatch({ type: "UPLOAD_FAIL", payload: getError(err) });
  //     enqueueSnackbar(getError(err), { variant: "error" });
  //   }
  // };

  const submitHandler = async ({
    name,
    slug,
    price,
    category,
    image,
    featuredImage,
    brand,
    countInStock,
    description,
  }) => {
    closeSnackbar();
    try {
      dispatch({ type: "UPDATE_REQUEST" });
      await axios.put(
        `/api/admin/products/${productId}`,
        {
          name,
          slug,
          price,
          category,
          image,
          isFeatured,
          featuredImage,
          brand,
          countInStock,
          description,
        },
        { headers: { authorization: `Bearer ${userInfo.token}` } }
      );
      dispatch({ type: "UPDATE_SUCCESS" });
      enqueueSnackbar("محصول با موفقیت اپدیت شد", { variant: "success" });
      router.push("/admin/products");
    } catch (err) {
      dispatch({ type: "UPDATE_FAIL", payload: getError(err) });
    }
  };
  const watchFieldName = watch("name");
  console.log(watchFieldName);

  const [isFeatured, setIsFeatured] = useState(false);
  return (
    <Layout title={`Edit Product ${productId}`}>
      <Grid container spacing={1}>
        <Grid item md={3} xs={12}>
          <Card className={classes.section}>
            <List>
              <NextLink href="/admin/dashboard" passHref>
                <ListItem button component="a">
                  <ListItemText primary="پنل ادمین"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/orders" passHref>
                <ListItem button component="a">
                  <ListItemText primary="سفارش ها"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/products" passHref>
                <ListItem selected button component="a">
                  <ListItemText primary="محصولات"></ListItemText>
                </ListItem>
              </NextLink>
              <NextLink href="/admin/users" passHref>
                <ListItem button component="a">
                  <ListItemText primary="کاربران"></ListItemText>
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
                  بروزرسانی محصول {productId}
                </Typography>
              </ListItem>
              <ListItem>
                {loading && <CircularProgress></CircularProgress>}
                {error && (
                  <Typography className={classes.error}>{error}</Typography>
                )}
              </ListItem>
              <ListItem>
                <form
                  onSubmit={handleSubmit(submitHandler)}
                  className={classes.form}
                >
                  <List>
                    <ListItem>
                      <Controller
                        name="name"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="name"
                            label="نام محصول"
                            error={Boolean(errors.name)}
                            helperText={
                              errors.name ? "وارد کردن نام محصول الزامیست" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="slug"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="slug"
                            Slug
                            is
                            required
                            label="مشخصه محصول"
                            helperText={
                              errors.slug
                                ? "وارد کردن مشخصه محصول الزامیست"
                                : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="price"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="price"
                            label="قیمت"
                            error={Boolean(errors.price)}
                            helperText={
                              errors.price ? "وارد کردن قیمت الزامیست" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="image"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="image"
                            label="ادرس عکس"
                            error={Boolean(errors.image)}
                            helperText={
                              errors.image ? "انتخاب عکس محصول الزامیست" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <FormControlLabel
                        label="انتخاب به عنوان بنر"
                        control={
                          <Checkbox
                            onClick={(e) => setIsFeatured(e.target.checked)}
                            checked={isFeatured}
                            name="isFeatured"
                          />
                        }
                      ></FormControlLabel>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="featuredImage"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="featuredImage"
                            disabled={!isFeatured}
                            label="ادرس عکس بنر"
                            error={Boolean(errors.image)}
                            helperText={
                              errors.image ? "وارد کردن عکس الزامیست" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="category"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="category"
                            label="دسته بندی"
                            error={Boolean(errors.category)}
                            helperText={
                              errors.category ? "Category is required" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="brand"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="brand"
                            label="برند"
                            error={Boolean(errors.brand)}
                            helperText={
                              errors.brand ? "وارد کردن برند الزامی است" : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="countInStock"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            id="countInStock"
                            label="تعداد در انبار"
                            error={Boolean(errors.countInStock)}
                            helperText={
                              errors.countInStock
                                ? "وارد کرد تعداد محصول در انبار اجباریست"
                                : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>
                    <ListItem>
                      <Controller
                        name="description"
                        control={control}
                        defaultValue=""
                        rules={{
                          required: true,
                        }}
                        render={({ field }) => (
                          <TextField
                            variant="outlined"
                            fullWidth
                            multiline
                            id="description"
                            label="توضیحات"
                            error={Boolean(errors.description)}
                            helperText={
                              errors.description
                                ? "وارد کردن توضیحات الزامیست"
                                : ""
                            }
                            {...field}
                          ></TextField>
                        )}
                      ></Controller>
                    </ListItem>

                    <ListItem>
                      <Button
                        variant="contained"
                        type="submit"
                        fullWidth
                        color="primary"
                      >
                        بروزرسانی
                      </Button>
                      {loadingUpdate && <CircularProgress />}
                    </ListItem>
                  </List>
                </form>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  return {
    props: { params },
  };
}

export default dynamic(() => Promise.resolve(ProductEdit), { ssr: false });
