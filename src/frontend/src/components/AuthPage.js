import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// --- Validation Rules ---

const loginSchema = yup.object({
    email: yup
        .string()
        .email('Enter a valid email address')
        .required('Email is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
});

const registerSchema = yup.object({
    fullName: yup
        .string()
        .min(2, 'Name must be at least 2 characters')
        .required('Full name is required'),
    email: yup
        .string()
        .email('Enter a valid email address')
        .required('Email is required'),
    phone: yup
        .string()
        .matches(/^[0-9]{10}$/, 'Enter a valid 10-digit phone number')
        .required('Phone number is required'),
    password: yup
        .string()
        .min(6, 'Password must be at least 6 characters')
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

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: yupResolver(isLogin ? loginSchema : registerSchema),
    });

    const onSubmit = (data) => {
        if (isLogin) {
            console.log('Login data:', data);
            alert('Login submitted! (Backend not connected yet)');
        } else {
            console.log('Register data:', data);
            alert('Registration submitted! (Backend not connected yet)');
        }
    };

    const handleToggle = (loginMode) => {
        setIsLogin(loginMode);
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

                <form onSubmit={handleSubmit(onSubmit)}>

                    {/* Full Name — Register only */}
                    {!isLogin && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Full Name</label>
                            <input
                                {...register('fullName')}
                                type="text"
                                placeholder="Enter your full name"
                                style={styles.input}
                            />
                            {errors.fullName && <p style={styles.errorText}>{errors.fullName.message}</p>}
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

                    {/* Phone — Register only */}
                    {!isLogin && (
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Phone Number</label>
                            <input
                                {...register('phone')}
                                type="text"
                                placeholder="Enter your 10-digit phone number"
                                style={styles.input}
                            />
                            {errors.phone && <p style={styles.errorText}>{errors.phone.message}</p>}
                        </div>
                    )}

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
                            {errors.confirmPassword && <p style={styles.errorText}>{errors.confirmPassword.message}</p>}
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" style={styles.submitButton}>
                        {isLogin ? 'Login' : 'Create Account'}
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