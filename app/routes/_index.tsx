import type { LoaderFunctionArgs } from '@remix-run/node'
import { getAuthenticatedUser } from '../services/auth.server';
import { redirect } from '@remix-run/node';
import AuthService from "../services/Auth.service";

// import { getClient } from '~/graphql/client'
// import { getAuthenticatedUser } from '~/services/auth.server'
// import { handleErrors } from '~/utils/index.server'

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // If the user is already authenticated redirect to /dashboard directly
  const user = await AuthService.isAuthenticated(request);
  if (user) {
    return redirect("/me");
  };
  return redirect('/login')


  // const url = new URL(request.url)
  // const { name, email, accessToken, nickname, lastName } =
  //   await getAuthenticatedUser(request)
  // const register_user = url.searchParams.get('register_user')

  // if (!name || !email) return redirect('/login')

  // const client = getClient(accessToken)
  // const { findUniqueAccount } = await client
  //   .query({
  //     findUniqueAccount: {
  //       __args: {
  //         where: {
  //           email,
  //         },
  //       },
  //       id: true,
  //       firstName: true,
  //       defaultWorkspace: {
  //         machineName: true,
  //       },
  //     },
  //   })
  //   .catch(handleErrors)

  // if (!findUniqueAccount && !register_user) {
  //   throw new Error('Account not found')
  // }

  // if (!findUniqueAccount) {
  //   const username = nickname || name.toLowerCase().replace(/ /g, '-')
  //   const { createOneAccount } = await client
  //     .mutation({
  //       createOneAccount: {
  //         __args: {
  //           data: {
  //             email,
  //             firstName: name,
  //             lastName: lastName || '',
  //             username,
  //             defaultWorkspace: {
  //               create: {
  //                 name: 'Personal Workspace',
  //                 machineName: username,
  //                 isPersonal: true,
  //               },
  //             },
  //             workspaceAccounts: {
  //               create: {
  //                 // @ts-ignore TODO: Bug in GenQL, review if updates in the future fix this
  //                 role: 'ADMIN',
  //                 workspace: {
  //                   connect: {
  //                     machineName: username,
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         id: true,
  //         firstName: true,
  //         defaultWorkspace: {
  //           machineName: true,
  //         },
  //       },
  //     })
  //     .catch(handleErrors)

  //   const {
  //     // @ts-ignore TODO: Bug in GenQL, review if updates in the future fix this
  //     defaultWorkspace: { machineName },
  //   } = createOneAccount

  //   if (!machineName) throw new Error('Workspace not found')

  //   return redirect(`/${machineName}`)
  // }

  // const {
  //   defaultWorkspace: { machineName },
  // } = findUniqueAccount

  // if (!machineName) throw new Error('Workspace not found')
  return redirect(`/login`)
};
