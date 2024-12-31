"use client";
import React from "react";
import { z } from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Image from "next/image";
import Link from "next/link";
import { createAccount, signInUser } from "@/lib/actions/user.actions";
import OTPModel from "../OTPModel";

type formType = "signIn" | "signUp";

const authFormSchema = (type: formType) => {
  return z.object({
    email: z
      .string()
      .min(2, {
        message: "Email must be at least 2 characters.",
      })
      .email(),
    fullName:
      type === "signUp" ? z.string().min(2).max(50) : z.string().optional(),
  });
};
const AuthForm = ({ type }: { type: formType }) => {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [errorMessage, seterrorMessage] = React.useState<string>("");
  const [accountId, setAccountId] = React.useState<string>("");
  // 1. Define your form.
  const formSchema = authFormSchema(type);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    seterrorMessage("");
    try {
      let user = null;
      if (type === "signUp") {
        user = await createAccount({
          email: values.email,
          fullName: values.fullName || "",
        });
      } else {
        user = await signInUser({ email: values.email });
      }
      setAccountId(user.accountId);
    } catch (error) {
      seterrorMessage(error as string);
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
        className="auth-form">
        <h1 className="form-title">
          {type === "signIn" ? "Sign In" : "Sign Up"}
        </h1>
        {type === "signUp" && (
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <div className="shad-form-item">
                  <FormLabel className="shad-form-label">Full Name</FormLabel>
                  <FormControl>
                    <Input
                      className="shad-input"
                      placeholder="please write your full Name"
                      {...field}
                    />
                  </FormControl>
                </div>

                <FormMessage className="shad-form-message" />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <div className="shad-form-item">
                <FormLabel className="form-label">Email</FormLabel>
                <FormControl>
                  <Input
                    className="shad-input"
                    placeholder="please write your email"
                    {...field}
                  />
                </FormControl>
              </div>
              <FormMessage className="shad-form-message" />
            </FormItem>
          )}
        />
        <Button
          className="form-submit-button"
          type="submit"
          disabled={isLoading}>
          {type === "signIn" ? "Sign In" : "Sign Up"}
          {isLoading && (
            <Image
              src="/assets/icons/loader.svg"
              width={24}
              height={24}
              alt="loader"
              className="animate-spin ml-2"
            />
          )}
        </Button>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <div className="body-2 flex justify-center ">
          <p className="text-light-100">
            {type === "signIn"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Link
              href={type === "signIn" ? "/sign-up" : "/sign-in"}
              className="ml-1 font-medium text-brand">
              {type === "signIn" ? "Sign Up" : "Sign In"}
            </Link>
          </p>
        </div>
        {accountId && (
          <OTPModel accountId={accountId} email={form.getValues("email")} />
        )}
      </form>
    </Form>
  );
};

export default AuthForm;
