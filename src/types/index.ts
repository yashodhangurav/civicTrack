import {
  User as PrismaUser,
  Complaint as PrismaComplaint,
  Department as PrismaDepartment,
  Category as PrismaCategory,
  Status as PrismaStatus,
  Location as PrismaLocation,
  Media as PrismaMedia,
  Log as PrismaLog,
  Role,
  Priority
} from '@prisma/client';

// Export the Enums directly
export { Role, Priority };

// Export the basic types
export type User = PrismaUser;
export type Department = PrismaDepartment;
export type Category = PrismaCategory;
export type Status = PrismaStatus;
export type Location = PrismaLocation;
export type Media = PrismaMedia;
export type Log = PrismaLog;

// Export extended types if you plan to include relational data often
export type ComplaintWithRelations = PrismaComplaint & {
  user: User;
  category: Category;
  department: Department;
  status: Status;
  location: Location;
  media: Media[];
  logs: Log[];
};

export type Complaint = PrismaComplaint;
