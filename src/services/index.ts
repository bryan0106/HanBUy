// Export all services for convenient importing
export * from './authService';
// Export userService but exclude User type to avoid conflict with authService
export {
  userService,
  type GetUsersParams,
  type GetUsersResponse,
  type UpdateUserRequest,
  type UpdateUserResponse,
} from './userService';
export * from './productService';
export * from './cartService';
export * from './orderService';
export * from './paymentService';
export * from './invoiceService';
export * from './boxService';
// Export trackingService but exclude TrackingEvent to avoid conflict with boxService
export {
  trackingService,
  type TrackingInfo,
  type GetTrackingResponse,
  type AddIncomingPackageRequest,
  type AddIncomingPackageResponse,
  type GetOutgoingPackagesParams,
  type GetOutgoingPackagesResponse,
} from './trackingService';
export * from './shippingService';
export * from './documentService';
export * from './notificationService';
export * from './likedService';
export * from './utilityService';
