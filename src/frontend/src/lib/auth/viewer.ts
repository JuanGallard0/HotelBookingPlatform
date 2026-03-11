export type AppAudience = "customer" | "admin";

export type Viewer = {
  name: string;
  email: string;
  role: AppAudience;
};

export function getDemoViewer(role: AppAudience): Viewer {
  if (role === "admin") {
    return {
      name: "Sofia Admin",
      email: "sofia.admin@stayfinder.test",
      role,
    };
  }

  return {
    name: "Jordan Guest",
    email: "jordan.guest@stayfinder.test",
    role,
  };
}
