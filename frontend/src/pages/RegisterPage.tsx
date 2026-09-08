import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { useAuthStore } from "../store/authStore";
import Input from "../components/Input";
import Button from "../components/Button";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().check(z.email("Please enter a valid email address")),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const registerMutation = useMutation({
    mutationFn: (data: Omit<RegisterFormData, "confirmPassword">) =>
      authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      navigate("/dashboard");
    },
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword, ...registerData } = data;
    void confirmPassword;
    registerMutation.mutate(registerData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">FreelanceFlow</h1>
          <p className="text-gray-500 mt-2">Create your account</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-5"
          >
            <Input
              label="Full name"
              type="text"
              placeholder="First & Last name"
              error={errors.name?.message}
              {...register("name")}
            />

            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 6 characters"
              error={errors.password?.message}
              {...register("password")}
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            {registerMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              isLoading={registerMutation.isPending}
              size="lg"
            >
              Create account
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-violet-600 font-medium hover:text-violet-700"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
