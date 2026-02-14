import { NavLink, Outlet } from 'react-router-dom'

export default function AdminView() {
  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-2xl font-semibold">
          Admin Dashboard
        </h2>
      </div>

      <nav className="flex space-x-6 border-b pb-3">
        <NavLink
          to="packages"
          end
          className={({ isActive }) =>
            isActive
              ? "text-aramexRed font-medium border-b-2 border-aramexRed pb-2"
              : "text-gray-600 hover:text-black"
          }
        >
          My Packages
        </NavLink>

        <NavLink
          to="packages/new"
          className={({ isActive }) =>
            isActive
              ? "text-aramexRed font-medium border-b-2 border-aramexRed pb-2"
              : "text-gray-600 hover:text-black"
          }
        >
          Create Package
        </NavLink>
      </nav>

      <div className="bg-white p-6 rounded-xl shadow">
        <Outlet />
      </div>
    </div>
  )
}
