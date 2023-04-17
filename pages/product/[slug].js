import React, { useContext, useEffect, useState } from "react";
import NextLink from "next/link";
import Image from "next/image";
import {
  Grid,
  Link,
  List,
  ListItem,
  Typography,
  Card,
  Button,
  TextField,
  CircularProgress,
} from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import Layout from "../../components/Layout";
import useStyles from "../../utils/styles";
import Product from "../../models/Product";
import db from "../../utils/db";
import axios from "axios";
import { Store } from "../../utils/Store";
import { getError } from "../../utils/error";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { productScreen as string } from "../../utils/string";

export default function ProductScreen(props) {
  const router = useRouter();
  const { state, dispatch } = useContext(Store);
  const { userInfo } = state;
  const { product } = props;
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `/api/products/${product._id}/reviews`,
        {
          rating,
          comment,
        },
        {
          headers: { authorization: `Bearer ${userInfo.token}` },
        }
      );
      setLoading(false);
      enqueueSnackbar("باز خورد با موفقیت ثبت شد", { variant: "success" });
      fetchReviews();
    } catch (err) {
      setLoading(false);
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(`/api/products/${product._id}/reviews`);
      setReviews(data);
    } catch (err) {
      enqueueSnackbar(getError(err), { variant: "error" });
    }
  };
  useEffect(() => {
    fetchReviews();
  }, []);

  if (!product) {
    return <div>{string.productNotFound}</div>;
  }
  const addToCartHandler = async () => {
    const existItem = state.cart.cartItems.find((x) => x._id === product._id);
    const quantity = existItem ? existItem.quantity + 1 : 1;
    const { data } = await axios.get(`/api/products/${product._id}`);
    if (data.countInStock < quantity) {
      window.alert("در حال حاظر محصول به اتمام رسیده");
      return;
    }
    dispatch({ type: "CART_ADD_ITEM", payload: { ...product, quantity } });
    router.push("/cart");
  };

  return (
    <Layout title={product.name} description={product.description}>
      <div className={classes.section}>
        <NextLink href="/" passHref>
          <Link>
            <Typography>{string?.back}</Typography>
          </Link>
        </NextLink>
      </div>
      <Grid container spacing={1}>
        <Grid item md={6} xs={12}>
          <img
            src={product.image}
            alt={product.name}
            width={"100%"}
            height={500}
            layout="responsive"
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <List>
            <ListItem>
              <Typography component="h1" variant="h1">
                {product.name}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                {string?.category}: {product.category}
              </Typography>
            </ListItem>
            <ListItem>
              <Typography>
                {string?.brand}: {product.brand}
              </Typography>
            </ListItem>
            <ListItem>
              <Rating value={product.rating} readOnly></Rating>
              <Link href="#reviews">
                <Typography>
                  ({product.numReviews} {string?.reviews})
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Typography>
                {string?.description}: {product.description}
              </Typography>
            </ListItem>
          </List>
        </Grid>
        <Grid item md={3} xs={12}>
          <Card>
            <List>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>{string?.price}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.price}
                      {string?.prefixMony}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography>{string?.status}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography>
                      {product.countInStock > 0
                        ? string?.inStock
                        : string.unavailable}
                    </Typography>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={addToCartHandler}
                >
                  {string?.addToCart}
                </Button>
              </ListItem>
            </List>
          </Card>
        </Grid>
      </Grid>
      <List>
        <ListItem>
          <Typography name="reviews" id="reviews" variant="h2">
            {string?.customerReviews}
          </Typography>
        </ListItem>
        {reviews.length === 0 && <ListItem>{string?.noReview}</ListItem>}
        {reviews.map((review) => (
          <ListItem key={review._id}>
            <Grid container>
              <Grid item>
                <Typography>
                  <strong>{review.name}</strong>
                </Typography>
                <Typography>{review.createdAt.substring(0, 10)}</Typography>
              </Grid>
              <Grid item className={classes.reviewItem}>
                <Rating value={review.rating} readOnly></Rating>
                <Typography>{review.comment}</Typography>
              </Grid>
            </Grid>
          </ListItem>
        ))}
        <ListItem>
          {userInfo ? (
            <form onSubmit={submitHandler} className={classes.reviewForm}>
              <List>
                <ListItem>
                  <Typography variant="h2">
                    {string?.leaveYourReview}
                  </Typography>
                </ListItem>
                <ListItem>
                  <TextField
                    multiline
                    variant="outlined"
                    fullWidth
                    name="review"
                    label={string.comment}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Rating
                    name="simple-controlled"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                  />
                </ListItem>
                <ListItem>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                  >
                    {string?.submit}
                  </Button>

                  {loading && <CircularProgress></CircularProgress>}
                </ListItem>
              </List>
            </form>
          ) : (
            <Typography variant="h2">
              {string?.writeReview}{" "}
              <Link href={`/login?redirect=/product/${product.slug}`}>
                {string?.login}
              </Link>{" "}
            </Typography>
          )}
        </ListItem>
      </List>
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const { params } = context;
  const { slug } = params;

  await db.connect();
  const product = await Product.findOne({ slug }, "-reviews").lean();
  await db.disconnect();
  return {
    props: {
      product: db.convertDocToObj(product),
    },
  };
}
