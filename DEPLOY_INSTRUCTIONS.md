# Deployment Guide: From AI Studio to a Live Website

This guide provides a reliable, manual method to get your code onto GitHub and deployed with Vercel.

**Follow these steps carefully:**

---

## Part 1: Create Your Project on GitHub

1.  Go to [github.com](https://github.com) and create a **new, empty repository**. Name it something like `realty-landing-pages`.
2.  Ensure the repository is **Public** and **do not** initialize it with a README, .gitignore, or license file.
3.  You will now manually create each file from the project using the GitHub web interface.

---

## Part 2: Manually Create Each File

For each file provided by the AI:
1.  In your GitHub repository, click **`Add file` -> `Create new file`**.
2.  Copy the **File Path** (e.g., `app/layout.tsx`) into the filename box. GitHub will automatically create the folders for you when you type `/`.
3.  Copy the entire **File Content** into the large text editor box.
4.  Click **`Commit new file`**.
5.  Repeat for every file in the list.

---

## Part 3: Deploy with Vercel

Once all the files are created on GitHub, your repository is ready.

1.  Sign up or log in to [vercel.com](https://vercel.com) using your GitHub account.
2.  Import the GitHub repository you just created.
3.  Vercel will automatically detect it's a Next.js project.
4.  **Crucial Step:** Go to the `Environment Variables` section in the Vercel project settings. You must add all your secret keys here. These include:
    *   `API_KEY` (Your Google Gemini API Key)
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
5.  Click `Deploy`.

**Congratulations! Your application should now be live.**
