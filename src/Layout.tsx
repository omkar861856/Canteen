import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import ColorModeSelect from './pages/shared-theme/ColorModeSelect';
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react';
import './Layout.css';
import { useNavigate } from 'react-router-dom';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import RamenDiningIcon from '@mui/icons-material/RamenDining';
import { useAppDispatch } from './store/hooks/hooks';
import ImportContactsIcon from '@mui/icons-material/ImportContacts';
import { io } from 'socket.io-client';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import Marquee from "react-fast-marquee";
import { update } from './store/slices/socketSlice';
import { Snackbar, Menu, MenuItem, IconButton, Badge, Typography } from '@mui/material';
import { useAppSelector } from './store/hooks/hooks';
import { addNotification, clearNotifications } from './store/slices/notificationsSlice';
import { useLocation } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import RateReviewIcon from '@mui/icons-material/RateReview';
import GeneralFeedbackModal from './components/GeneralFeedback';
import { useUser } from '@clerk/clerk-react';


const notificationSound = new Audio('src/audios/simple-notification-152054.mp3');

function playNotificationSound() {
  notificationSound.play();
}

interface LayoutProps {
  children: React.ReactNode;
}

// Backend URL link 
export const apiUrl = import.meta.env.VITE_API_URL;
export const razorpay_key_id = import.meta.env.VITE_RAZORPAY_KEY_ID;
export const socket = io(import.meta.env.VITE_SOCKET_API_URL, {
  reconnection: true, // Allow reconnections
  reconnectionAttempts: 5, // Number of attempts before giving up
  reconnectionDelay: 2000, // Delay between reconnection attempts
});


export default function Layout({ children }: LayoutProps) {
  const [value, setValue] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const isInitialized = useRef(false); // To ensure logic runs only once per session
  const dispatch = useAppDispatch();
  const socketRef = useRef(socket);
  const [socketConnection, setSocketConnection] = useState(false)
  const location = useLocation();
  const user = useUser();

  const [menuInvisible] = useState(false)
  const [cartInvisible] = useState(false)
  const [ordersInvisible] = useState(false)

  // const handleBadgeVisibility = () => {
  //   setInvisible(!invisible);
  // };

  useEffect(() => {
    // Use a switch statement to set the value based on the path
    switch (location.pathname) {
      case '/':
        setValue(0);
        break;
      case '/cart':
        setValue(1);
        break;
      case '/orders':
        setValue(2);
        break;
      default:
        setValue(0); // Default value for unknown paths
        break;
    }
  }, [location.pathname]);

  // // Show notification with sound
  // const showNotification = (message: string) => {
  //   if (Notification.permission === 'granted') {
  //     const notification = new Notification("New Notification", {
  //       body: message,
  //       icon: 'path_to_your_icon/notification-icon.png', // Optional icon
  //     });

  //     playNotificationSound(); // Play sound when notification appears

  //     notification.onclick = () => {
  //       console.log("Notification clicked!");
  //     };
  //   }
  // };

  // Clear stale local storage once per session
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;

      // Clear local storage only if not cleared for this session
      if (!sessionStorage.getItem("localStorageCleared")) {
        localStorage.clear();
        sessionStorage.setItem("localStorageCleared", "true");
        console.log("Local storage cleared once for this session.");
      }
    }

    return () => {
      console.log("Layout unmounting (clean-up logic if required).");
    };
  }, []);

  useEffect(() => {
    if (ref.current) {
      ref.current.ownerDocument.body.scrollTop = 0;
    }

    // Request permission for notifications when the component mounts
    if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        }
      });
    }
  }, [value]);


  useEffect(() => {
    const socketInstance = socketRef.current;

    if (user?.user?.id) {

      // Register the client with a user ID
      socket.emit("register", user.user.id);


    }
    // Listen for the broadcast from the server
    socketInstance.on("order-update-server", () => {
      dispatch(update());
    });


    // Join specific rooms for notifications
    // socket.emit('joinRoom', 'menu');
    // socket.emit('joinRoom', 'order');
    // socket.emit('joinRoom', 'payment');

    // Listen for notifications
    socketInstance.on('notification', (data: String) => {
      console.log(data)
      dispatch(addNotification(data));
      playNotificationSound()
    });

    socketInstance.on('disconnect', (reason) => {
      console.log(`Disconnected: ${reason}`);
    });

    // Clean up listeners on unmount
    return () => {
      setSocketConnection(false)

      socketInstance.off("connect");
      socketInstance.off("order-update-server");
      socketInstance.off('notification');

    };
  }, [dispatch, socketConnection, user]);

  return (
    <Box sx={{ pb: 7 }} ref={ref}>
      <CssBaseline />
      <div id="setting-nav">
        <ColorModeSelect />
        <div className='icons-right'>
          <CallCanteenIcon />
          <FeedbackIcon />
          <NotificationIconWithMenu />
        </div>
      </div>
      <div className="info-nav">
        <Marquee>
          Canteen will be closed on Sundays
        </Marquee>
      </div>
      <div id='layout-children'>{children}</div>
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} elevation={3}>
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_, newValue) => {
            setValue(newValue);
          }}
        >
          <BottomNavigationAction onClick={() => navigate("/")} label="Menu" icon={<Badge color="primary" variant="dot" invisible={menuInvisible}>
            <ImportContactsIcon />          </Badge>
          } />
          <BottomNavigationAction onClick={() => navigate("/cart")} label="Cart" icon={<Badge color="primary" variant="dot" invisible={cartInvisible}><ShoppingCartIcon /></Badge>} />
          <BottomNavigationAction onClick={() => navigate("/orders")} label="Orders" icon={<Badge color="primary" variant="dot" invisible={ordersInvisible}><RamenDiningIcon /></Badge>} />
          <BottomNavigationAction label="Profile" icon={
            <>
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </>
          } />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}

const NotificationIconWithMenu = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const notificationss = useAppSelector(state => state.notifications)
  const notifications = notificationss.notifications
  const dispatch = useAppDispatch();

  // const notifications = [
  //   "New order received!",
  //   "Payment failed!",
  // ];

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    handleClear()
  };

  const handleSnackbarOpen = () => {
    setOpenSnackbar(true);
  };

  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
    handleClear()
  };


  function handleClear() {

    dispatch(clearNotifications())

  }

  return (
    <Box sx={{ display: "flex", alignItems: "center", padding: 2 }}>
      <IconButton onClick={handleClick} color="primary">
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          style: { maxHeight: 200, width: "90%" },
        }}
      >
        {notifications.length > 0 ? (

          notifications.map((notification, index) => (
            <MenuItem key={index} onClick={handleSnackbarOpen}>
              <Typography variant="body2">{notification}</Typography>
            </MenuItem>
          ))

        ) : (
          <MenuItem>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        )}
      </Menu>
      <Snackbar
        open={openSnackbar}
        onClose={handleSnackbarClose}
        message="Notification clicked!"
        autoHideDuration={3000}
      />
    </Box>
  );
};


function CallCanteenIcon() {
  function handleClick() {
    alert('Call button clicked!');
  }
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
      <IconButton onClick={handleClick} color="primary">
        <LocalPhoneIcon />
      </IconButton>
    </Box>
  );
}

function FeedbackIcon() {


  const [isFeedbackModalOpen, setFeedbackModalOpen] = useState(false);

  const handleOpenModal = () => setFeedbackModalOpen(true);
  const handleCloseModal = () => setFeedbackModalOpen(false);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', padding: 2 }}>
      <IconButton onClick={handleOpenModal} color="primary">
        <RateReviewIcon />
      </IconButton>
      <GeneralFeedbackModal
        open={isFeedbackModalOpen}
        onClose={handleCloseModal}
      />
    </Box>
  );

}