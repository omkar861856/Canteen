import { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SignUpLoginForm.css';
import { apiUrl } from '../Layout';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks/hooks';
import { logoutUser, setToken, login } from '../store/slices/authSlice';

const SignUpLoginForm = () => {
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const { isLoggedIn, phone } = useAppSelector(state => state.auth);
    const [, setTimer] = useState(30); // Initial timer duration
    const [isButtonVisible] = useState(false); // Control button visibility
    const [otpCount, setOtpCount] = useState(0); // Tracks OTPs sent
    const [cooldown, setCooldown] = useState(0); // Cooldown period (seconds)
    const {kitchenId} = useAppSelector(state=>state.app)

    const startCooldown = (duration:number) => {
        setCooldown(duration);
        const interval = setInterval(() => {
            setCooldown(prev => {
                if (prev > 1) return prev - 1;
                clearInterval(interval);
                return 0;
            });
        }, 1000);
    };

    const onSendOtp = async (data: any) => {
        if (otpCount >= 3) {
            toast.error('Maximum OTP limit reached for 1 hour.');
            return;
        }

        if (cooldown > 0) {
            toast.info(`Please wait ${cooldown} seconds before requesting another OTP.`);
            return;
        }

        setFirstName(data.firstName);
        setLastName(data.lastName);
        setPhoneNumber(data.phone);

        try {
             await axios.post(`${apiUrl}/auth/signup/send-otp`, {
                firstName: data.firstName,
                lastName: data.lastName,
                phone: data.phone,
                connectedKitchen: kitchenId
            });

            toast.success('OTP sent successfully!');
            setIsOtpSent(true);
            setOtpCount(prev => prev + 1);

            if (otpCount === 0) {
                setTimer(30); // 30 seconds cooldown for the first OTP
                startCooldown(30);
            } else if (otpCount === 1) {
                setTimer(300); // 5 minutes cooldown for the second OTP
                startCooldown(300);
            }
        } catch (err: any) {
            if (err.response?.status === 409) {
                toast.error('Phone number already registered - Sign In');
                navigate(`/${kitchenId}/signin`);
            } else {
                toast.error('Error sending OTP. Please try again.');
            }
        }
    };

    const onVerifyOtp = async (data: any) => {
        try {
            const res = await axios.post(`${apiUrl}/auth/verify-otp`, {
                phone: data.phone,
                otp: data.otp
            });

            dispatch(setToken(res.data.token));
            dispatch(login(res.data.user));
            navigate(`/${kitchenId}`);
            toast.success('Signup successful!');
            reset();
        } catch (err) {
            toast.error('Invalid OTP. Try again.');
        }
    };

    const resendOtp = () => {
        if (cooldown > 0) {
            toast.info(`Please wait ${cooldown} seconds before requesting another OTP.`);
            return;
        }

        onSendOtp({ firstName, lastName, phone: phoneNumber });
    };

    const onLogout = async () => {
        await dispatch(logoutUser(phone));
        dispatch({ type: 'RESET_STORE' });
        toast.success('Logoutsuccessful!');
        navigate(`/${kitchenId}/signin`)  };

    return (
        <div className="form-container">
            <h4>Sign Up</h4>
            <ToastContainer />
            {!isLoggedIn ? (
                <form onSubmit={handleSubmit(isOtpSent ? onVerifyOtp : onSendOtp)}>
                    {!isOtpSent && (
                        <>
                            <input
                                type="text"
                                placeholder="First Name"
                                {...register('firstName', { required: true })}
                            />
                            {errors.firstName && <p>First Name is required</p>}
                            <input
                                type="text"
                                placeholder="Last Name"
                                {...register('lastName', { required: true })}
                            />
                            {errors.lastName && <p>Last Name is required</p>}
                            <input
                                type="text"
                                placeholder="Phone Number (10 digits only)"
                                {...register('phone', { required: true, pattern: /^[6-9]\d{9}$/ })}
                            />
                            {errors.phone && <p>Enter a valid phone number</p>}
                        </>
                    )}
                    {isOtpSent && (
                        <input
                            type="text"
                            placeholder="Enter OTP"
                            {...register('otp', { required: true })}
                        />
                    )}
                    {isOtpSent && (
                        <div>
                            {isButtonVisible ? (
                                <button type="button" onClick={resendOtp}>Resend OTP</button>
                            ) : (
                                <p>Resend OTP in {cooldown} seconds</p>
                            )}
                        </div>
                    )}
                    <button type="submit">{isOtpSent ? 'Verify OTP' : 'Send OTP'}</button>
                </form>
            ) : (
                <div>
                    <p>You are logged in</p>
                    <button onClick={onLogout}>Logout</button>
                </div>
            )}
            <h5>
                <a id='signin' onClick={() => navigate('/:kitchenId/signin')}>Sign in</a>
                &nbsp;
                If you already have an account.
            </h5>
        </div>
    );
};

export default SignUpLoginForm;