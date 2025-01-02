import React, { useEffect, useState } from 'react';
import {
  Typography,
  Card,
  Box,
  CircularProgress,
  Button,
  Grid,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { setCart } from '../store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { apiUrl } from '../Layout';
import { fetchInventory, InventoryItem } from '../store/slices/menuSlice';

const MenuItem = ({ item }: { item: InventoryItem }) => {
  const dispatch = useAppDispatch();

  const addItemToCart = () => {
    const serializedItem = {
      ...item,
      quantity: 1,
    };
    dispatch(setCart(serializedItem));
    toast.success(`${item.name} added to cart!`, {
      position: 'top-center',
    });
  };

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: '12px',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
        padding: 2,
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.03)',
        },
      }}
    >
      <img
        src={`${apiUrl}/inventory/${item.itemId}`}
        alt={item.name}
        style={{
          width: '100px',
          height: '100px',
          borderRadius: '12px',
          marginRight: '16px',
        }}
      />
      <Box sx={{ flex: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 'bold', marginBottom: '8px' }}
        >
          {item.name}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ marginBottom: '12px' }}>
          ₹{item.price}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={addItemToCart}
          sx={{
            borderRadius: '8px',
            fontWeight: 'bold',
            textTransform: 'none',
          }}
        >
          Add to Cart
        </Button>
      </Box>
    </Card>
  );
};

const Menu: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const { kitchenStatus } = useAppSelector((state) => state.app); // Access kitchenStatus from the store
  const { inventory } = useAppSelector(state => state.menu)
  const {notifications} = useAppSelector(state=>state.notifications)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (kitchenStatus) {
      (async () => {
        try {
          dispatch(fetchInventory())
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false); // Ensure loading state ends even if kitchen is offline
    }
  }, [kitchenStatus, dispatch, notifications]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
        <CircularProgress />
      </Box>
    );
  }

  const categorizedInventory = inventory.reduce(
    (acc: Record<string, InventoryItem[]>, item) => {
      if (item.availability) { // Check if the item is available
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
      }
      return acc;
    },
    {}
  );

 

  return (
    <div>
      {kitchenStatus
        ?
        <Box sx={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
          <ToastContainer />
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              color: '#1976d2',
              marginBottom: '20px',
            }}
          >
            Explore Our Menu
          </Typography>
          <hr />
          {Object.keys(categorizedInventory).map((category) => (
            <Box key={category} sx={{ marginBottom: '40px' }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#f57c00',
                  fontWeight: 'bold',
                  marginBottom: '10px',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </Typography>
              <Grid container spacing={2}>
                {categorizedInventory[category].map((item) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.itemId}>
                    <MenuItem item={item} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Box>
        :
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <Typography
            variant="h6"
            sx={{ color: 'red', fontWeight: 'bold' }}
          >
            The kitchen is currently offline. Please check back later.
          </Typography>
        </Box>
      }
    </div>
  );
};

export default Menu;

