import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

// --- Axios instance ---
const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

// --- Validation Rules ---

const loginSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .required('Password is required'),
});

const registerSchema = yup.object({
    name: yup
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters')
        .required('Full name is required'),
    email: yup
        .string()
        .email('Enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(8, 'Password must be at least 8 characters')
        .matches(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
        .matches(/[0-9]/, 'Password must contain at least 1 number')
        .matches(/[^A-Za-z0-9]/, 'Password must contain at least 1 special character')
        .required('Password is required'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password')], 'Passwords do not match')
        .required('Please confirm your password'),
});

// --- Styles ---

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f3f4f6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 16px',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '440px',
        padding: '40px',
    },
    toggleContainer: {
        display: 'flex',
        backgroundColor: '#f3f4f6',
        borderRadius: '12px',
        padding: '4px',
        marginBottom: '32px',
    },
    toggleButtonActive: {
        flex: 1,
        padding: '10px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: '#ffffff',
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
        fontWeight: '600',
        fontSize: '14px',
        color: '#1e2d3d',
        cursor: 'pointer',
    },
    toggleButtonInactive: {
        flex: 1,
        padding: '10px',
        borderRadius: '10px',
        border: 'none',
        backgroundColor: 'transparent',
        fontWeight: '600',
        fontSize: '14px',
        color: '#9ca3af',
        cursor: 'pointer',
    },
    heading: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#1e2d3d',
        marginBottom: '24px',
    },
    fieldGroup: {
        marginBottom: '16px',
    },
    label: {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
    },
    input: {
        width: '100%',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '14px',
        outline: 'none',
        boxSizing: 'border-box',
    },
    errorText: {
        color: '#ef4444',
        fontSize: '12px',
        marginTop: '4px',
    },
    successText: {
        color: '#16a34a',
        fontSize: '13px',
        marginBottom: '12px',
        textAlign: 'center',
    },
    apiErrorText: {
        color: '#ef4444',
        fontSize: '13px',
        marginBottom: '12px',
        textAlign: 'center',
    },
    submitButton: {
        width: '100%',
        backgroundColor: '#1e2d3d',
        color: '#ffffff',
        padding: '12px',
        borderRadius: '8px',
        border: 'none',
        fontWeight: '600',
        fontSize: '14px',
        cursor: 'pointer',
        marginTop: '8px',
    },
    bottomText: {
        textAlign: 'center',
        fontSize: '13px',
        color: '#6b7280',
        marginTop: '24px',
    },
    linkButton: {
        background: 'none',
        border: 'none',
        color: '#2563eb',
        fontWeight: '500',
        cursor: 'pointer',
        fontSize: '13px',
        textDecoration: 'underline',
    },
};

// --- Main Component ---

function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [apiError, setApiError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(isLogin ? loginSchema : registerSchema),
    });

    const onSubmit = async (data) => {
        setApiError('');
        setSuccessMessage('');
        setIsLoading(true);

        try {
            if (isLogin) {
                // --- Login ---
                const response = await api.post('/auth/login', {
                    email: data.email,
                    password: data.password,
                });

                if (response.data.success) {
                    setSuccessMessage('Login successful! Welcome back.');
                }

            } else {
                // --- Register ---
                const response = await api.post('/auth/register', {
                    name: data.name,
                    email: data.email,
                    password: data.password,
                });

                if (response.data.success) {
                    setSuccessMessage('Account created successfully! You can now log in.');
                    handleToggle(true);
                }
            }

        } catch (error) {
            if (error.response) {
                // Backend returned an error response
                const errData = error.response.data;
                if (errData.errors && errData.errors.length > 0) {
                    setApiError(errData.errors[0].message);
                } else {
                    setApiError(errData.message || 'Something went wrong. Please try again.');
                }
            } else {
                setApiError('Cannot connect to server. Make sure the backend is running.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggle = (loginMode) => {
        setIsLogin(loginMode);
        setApiError('');
        setSuccessMessage('');
        reset();
    };

    return (
        <div style={styles.page}>
            <div style={styles.card}>

                {/* Toggle */}
                <div style={styles.toggleContainer}>
                    <button
                        type="button"
                        onClick={() => handleToggle(true)}
                        style={isLogin ? styles.toggleButtonActive : styles.toggleButtonInactive}
                    >
                        Login
                    </button>
                    <button
                        type="button"
                        onClick={() => handleToggle(false)}
                        style={!isLogin ? styles.toggleButtonActive : styles.toggleButtonInactive}
                    >
                        Register
                    </button>
                </div>

                <h2 style={styles.heading}>
                    {isLogin ? 'Welcome back' : 'Create an account'}
                </h2>

                {/* Success / Error messages */}
                {successMessage && <p style={styles.successText}>{successMessage}</p>}
                {apiError && <p style={styles.apiErrorText}>{apiError}</p>}

                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* Name — Register only */}
                    {!isLogin && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                {...register('name')}
                                type="text"
                                placeholder="Enter your full name"
                                style={styles.input}
                            />
                            {errors.name && <p style={styles.errorText}>{errors.name.message}</p>}
                        </div>
                    )}

                    {/* Email */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            {...register('email')}
                            type="text"
                            placeholder="Enter your email"
                            style={styles.input}
                        />
                        {errors.email && <p style={styles.errorText}>{errors.email.message}</p>}
                    </div>

                    {/* Password */}
                    <div style={styles.fieldGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="Enter your password"
                            style={styles.input}
                        />
                        {errors.password && <p style={styles.errorText}>{errors.password.message}</p>}
                    </div>

                    {/* Confirm Password — Register only */}
                    {!isLogin && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <input
                                {...register('confirmPassword')}
                                type="password"
                                placeholder="Re-enter your password"
                                style={styles.input}
                            />
                            {errors.confirmPassword && (
                                <p style={styles.errorText}>{errors.confirmPassword.message}</p>
                            )}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        style={{
                            ...styles.submitButton,
                            opacity: isLoading ? 0.7 : 1,
                        }}
                        disabled={isLoading}
                    >
                        {isLoading
                            ? 'Please wait...'
                            : isLogin ? 'Login' : 'Create Account'}
                    </button>

                </form>

                {/* Switch link */}
                <p style={styles.bottomText}>
                    {isLogin ? "Don't have an account? " : 'Already have an account? '}
                    <button
                        type="button"
                        onClick={() => handleToggle(!isLogin)}
                        style={styles.linkButton}
                    >
                        {isLogin ? 'Register here' : 'Login here'}
                    </button>
                </p>

            </div>
        </div>
    );
}

export default AuthPage;