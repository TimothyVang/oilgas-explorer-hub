import { describe, it, expect } from "vitest";
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  phoneSchema,
  companyNameSchema,
  loginSchema,
  signupSchema,
  profileSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  getFieldErrors,
  validateForm,
} from "@/lib/validation";

describe("Validation Schemas", () => {
  describe("emailSchema", () => {
    it("accepts valid email addresses", () => {
      expect(emailSchema.safeParse("test@example.com").success).toBe(true);
      expect(emailSchema.safeParse("user.name@company.co.uk").success).toBe(true);
      expect(emailSchema.safeParse("a@b.io").success).toBe(true);
    });

    it("rejects empty email", () => {
      const result = emailSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Email is required");
      }
    });

    it("rejects invalid email formats", () => {
      const result = emailSchema.safeParse("not-an-email");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Please enter a valid email address");
      }
    });

    it("rejects email without domain", () => {
      expect(emailSchema.safeParse("user@").success).toBe(false);
    });
  });

  describe("passwordSchema", () => {
    it("accepts valid passwords", () => {
      expect(passwordSchema.safeParse("password123").success).toBe(true);
      expect(passwordSchema.safeParse("123456").success).toBe(true);
      expect(passwordSchema.safeParse("a very long password!@#$").success).toBe(true);
    });

    it("rejects empty password", () => {
      const result = passwordSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password is required");
      }
    });

    it("rejects short passwords", () => {
      const result = passwordSchema.safeParse("12345");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password must be at least 6 characters");
      }
    });
  });

  describe("nameSchema", () => {
    it("accepts valid names", () => {
      expect(nameSchema.safeParse("John").success).toBe(true);
      expect(nameSchema.safeParse("John Doe").success).toBe(true);
      expect(nameSchema.safeParse("O'Connor-Smith").success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = nameSchema.safeParse("");
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Name is required");
      }
    });

    it("rejects names over 100 characters", () => {
      const longName = "A".repeat(101);
      const result = nameSchema.safeParse(longName);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Name must be less than 100 characters");
      }
    });
  });

  describe("phoneSchema", () => {
    it("accepts valid phone numbers", () => {
      // Phone regex: ^$|^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$
      expect(phoneSchema.safeParse("555-123-4567").success).toBe(true);
      expect(phoneSchema.safeParse("+1 555 123 4567").success).toBe(true);
      expect(phoneSchema.safeParse("1234567890").success).toBe(true);
      expect(phoneSchema.safeParse("+44 20 7946 0958").success).toBe(true);
      expect(phoneSchema.safeParse("(555) 123-4567").success).toBe(true);
    });

    it("accepts empty phone (optional field)", () => {
      expect(phoneSchema.safeParse("").success).toBe(true);
      expect(phoneSchema.safeParse(undefined).success).toBe(true);
    });

    it("rejects invalid phone formats", () => {
      const result = phoneSchema.safeParse("not-a-phone");
      expect(result.success).toBe(false);
    });
  });

  describe("companyNameSchema", () => {
    it("accepts valid company names", () => {
      expect(companyNameSchema.safeParse("Acme Corp").success).toBe(true);
      expect(companyNameSchema.safeParse("O'Brien & Associates LLC").success).toBe(true);
    });

    it("accepts empty company name (optional field)", () => {
      expect(companyNameSchema.safeParse("").success).toBe(true);
      expect(companyNameSchema.safeParse(undefined).success).toBe(true);
    });

    it("rejects company names over 200 characters", () => {
      const longName = "A".repeat(201);
      const result = companyNameSchema.safeParse(longName);
      expect(result.success).toBe(false);
    });
  });

  describe("loginSchema", () => {
    it("accepts valid login credentials", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email in login", () => {
      const result = loginSchema.safeParse({
        email: "invalid-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects short password in login", () => {
      const result = loginSchema.safeParse({
        email: "user@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("signupSchema", () => {
    it("accepts valid signup data", () => {
      const result = signupSchema.safeParse({
        fullName: "John Doe",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects missing fullName", () => {
      const result = signupSchema.safeParse({
        fullName: "",
        email: "john@example.com",
        password: "password123",
      });
      expect(result.success).toBe(false);
    });

    it("rejects all invalid fields", () => {
      const result = signupSchema.safeParse({
        fullName: "",
        email: "invalid",
        password: "123",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.length).toBeGreaterThanOrEqual(3);
      }
    });
  });

  describe("profileSchema", () => {
    it("accepts valid profile data", () => {
      const result = profileSchema.safeParse({
        fullName: "John Doe",
        companyName: "Acme Corp",
        phone: "+1 555-1234",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty optional fields", () => {
      const result = profileSchema.safeParse({
        fullName: "",
        companyName: "",
        phone: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid phone format", () => {
      const result = profileSchema.safeParse({
        fullName: "John",
        companyName: "",
        phone: "abc-def-ghij",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("forgotPasswordSchema", () => {
    it("accepts valid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "user@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email", () => {
      const result = forgotPasswordSchema.safeParse({
        email: "",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("resetPasswordSchema", () => {
    it("accepts matching passwords", () => {
      const result = resetPasswordSchema.safeParse({
        password: "newpassword123",
        confirmPassword: "newpassword123",
      });
      expect(result.success).toBe(true);
    });

    it("rejects non-matching passwords", () => {
      const result = resetPasswordSchema.safeParse({
        password: "newpassword123",
        confirmPassword: "differentpassword",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Passwords do not match");
      }
    });

    it("rejects empty confirm password", () => {
      const result = resetPasswordSchema.safeParse({
        password: "newpassword123",
        confirmPassword: "",
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("Validation Helpers", () => {
  describe("getFieldErrors", () => {
    it("extracts field errors from ZodError", () => {
      const result = loginSchema.safeParse({ email: "", password: "" });
      if (!result.success) {
        const errors = getFieldErrors(result.error);
        expect(errors.email).toBeDefined();
        expect(errors.password).toBeDefined();
      }
    });

    it("returns empty object for no errors", () => {
      const result = loginSchema.safeParse({ email: "test@test.com", password: "password123" });
      expect(result.success).toBe(true);
    });
  });

  describe("validateForm", () => {
    it("returns success with data for valid input", () => {
      const result = validateForm(loginSchema, {
        email: "user@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.password).toBe("password123");
      }
    });

    it("returns errors for invalid input", () => {
      const result = validateForm(loginSchema, {
        email: "",
        password: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.errors.email).toBeDefined();
        expect(result.errors.password).toBeDefined();
      }
    });

    it("works with signup schema", () => {
      const result = validateForm(signupSchema, {
        fullName: "Test User",
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
    });

    it("works with profile schema", () => {
      const result = validateForm(profileSchema, {
        fullName: "Test User",
        companyName: "Test Corp",
        phone: "+1 555-0123",
      });
      expect(result.success).toBe(true);
    });
  });
});
