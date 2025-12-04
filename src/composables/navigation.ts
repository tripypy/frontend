import { useRouter } from 'vue-router'

export function useNavigate() {
  const router = useRouter()

  const handleNavigate = (page: string) => {
    if (page === 'main') router.push('/')
    else if (page === 'search') router.push('/search')
    else if (page === 'trips') router.push('/trips')
    else if (page === 'log') router.push('/log')
    else if (page === 'create-trip') router.push('/create-trip')
  }

  return {
    handleNavigate
  }
}
