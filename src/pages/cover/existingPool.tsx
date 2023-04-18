import CoverExistingPool from '../../components/Cover/CoverExistingPool'
import Navbar from '../../components/Navbar'
import Link from 'next/link'
import { useRouter } from 'next/router'

export default function coverExistingPool({}) {
  const router = useRouter()
  return (
    <div className="bg-[url('/static/images/background.svg')] bg-no-repeat bg-cover min-h-screen font-Satoshi ">
      <Navbar />
      <div className="flex justify-center w-full text-white">
        <div className="mt-[16vh] w-[55rem]">
          <CoverExistingPool goBack={() => router.back()} />
        </div>
      </div>
    </div>
  )
}
