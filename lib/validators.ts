import { z } from 'zod';

// Admin validation schema
export const adminSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Super Admin', 'Admin', 'Manager', 'Viewer']),
  restrictions: z.array(z.string()).optional().default([]),
  online: z.boolean().optional().default(false),
  changes: z.array(z.string()).optional().default([]),
  organizationName: z.string().min(1, 'Organization name is required').max(100, 'Organization name must be less than 100 characters').optional().default('Helping Hands')
});

export const adminUpdateSchema = adminSchema.partial();

// Donor validation schema
export const donorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().email('Invalid email address'),
  total: z.number().nonnegative('Total must be non-negative').optional().default(0),
  lastDonation: z.string().datetime().optional().nullable(),
  status: z.enum(['Active', 'Inactive', 'Pending']),
  tags: z.array(z.string()).optional().default([])
});

export const donorUpdateSchema = donorSchema.partial();

// Campaign validation schema
export const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(200, 'Name must be less than 200 characters'),
  goal: z.number().positive('Goal must be a positive number'),
  raised: z.number().nonnegative('Raised amount must be non-negative').optional().default(0),
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format'),
  description: z.string().min(1, 'Description is required')
}).refine(data => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end > start;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

export const campaignUpdateSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(200, 'Name must be less than 200 characters').optional(),
  goal: z.number().positive('Goal must be a positive number').optional(),
  raised: z.number().nonnegative('Raised amount must be non-negative').optional(),
  startDate: z.string().datetime('Invalid start date format').optional(),
  endDate: z.string().datetime('Invalid end date format').optional(),
  description: z.string().min(1, 'Description is required').optional()
}).refine(data => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    return end > start;
  }
  return true;
}, {
  message: 'End date must be after start date',
  path: ['endDate']
});

// Event validation schema
export const eventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(200, 'Name must be less than 200 characters'),
  date: z.string().datetime('Invalid date format'),
  description: z.string().min(1, 'Description is required'),
  image: z.string().url('Invalid image URL').optional().nullable(),
  campaignId: z.number().int().positive('Invalid campaign ID').optional().nullable()
});

export const eventUpdateSchema = eventSchema.partial();

// Notification validation schema
export const notificationSchema = z.object({
  type: z.enum(['Info', 'Warning', 'Error', 'Success']),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  date: z.string().datetime('Invalid date format'),
  read: z.boolean().optional().default(false)
});

export const notificationUpdateSchema = notificationSchema.partial();

// Donation validation schema
export const donationSchema = z.object({
  amount: z.number().positive('Amount must be a positive number'),
  date: z.string().datetime('Invalid date format'),
  donorId: z.number().int().positive('Valid donor ID is required'),
  campaignId: z.number().int().positive('Invalid campaign ID').optional().nullable()
});

export const donationUpdateSchema = donationSchema.partial();

// Login validation schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Helper function to validate data
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown) {
  return schema.safeParse(data);
}

// Helper function to format validation errors
export function formatValidationErrors(error: z.ZodError<any>) {
  return error.issues.map((err: any) => ({
    field: err.path.join('.') || 'unknown',
    message: err.message
  }));
}
