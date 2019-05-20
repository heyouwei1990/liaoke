import Vue from 'vue'
import Router from 'vue-router'
/*const Index = r => require.ensure([], () => r(require('@/pages/index')), 'index')
const Ranking = r => require.ensure([], () => r(require('@/pages/ranking')), 'ranking')
const Mall = r => require.ensure([], () => r(require('@/pages/mall')), 'mall')
const LiveRoom = r => require.ensure([], () => r(require('@/pages/liveRoom')), 'liveRoom')
const Recharge = r => require.ensure([], () => r(require('@/pages/recharge')), 'recharge')
const Center = r => require.ensure([], () => r(require('@/pages/center')), 'center')
const Information = r => require.ensure([], () => r(require('@/pages/center/information')), 'information')
const Message = r => require.ensure([], () => r(require('@/pages/center/message')), 'message')
const Ward = r => require.ensure([], () => r(require('@/pages/center/ward')), 'ward')
const Favorate = r => require.ensure([], () => r(require('@/pages/center/favorate')), 'favorate')
const VisitRecord = r => require.ensure([], () => r(require('@/pages/center/visitRecord')), 'visitRecord')*/
import Index from '@/pages/index'
import Ranking from '@/pages/ranking'
import Mall from '@/pages/mall'
import LiveRoom from '@/pages/liveRoom'
import Recharge from '@/pages/recharge'
import Center from '@/pages/center'
import Information from '@/pages/center/information'
import Message from '@/pages/center/message'
import Ward from '@/pages/center/ward'
import Favorate from '@/pages/center/favorate'
import VisitRecord from '@/pages/center/visitRecord'
import Packbag from '@/pages/center/package'
import Zone from '@/pages/zone'
import Activity from '@/pages/center/activity'
import PhotoAlbum from '@/pages/center/photoAlbum'
import Video from '@/pages/center/video'
import CustomService from '@/pages/center/customService'
import Edit from '@/pages/edit'
import InfoEdit from '@/pages/edit/infoEdit'
import TagEdit from '@/pages/edit/tagEdit'
import PublicEdit from '@/pages/edit/publicEdit'
import PrivateEdit from '@/pages/edit/privateEidt'

Vue.use(Router)
export default new Router({
  mode:'history',
  routes: [
    {
      path: '/site1',
      name: 'Index',
      component: Index,
    },
    {
      path: '/ranking',
      name: 'Ranking',
      component: Ranking
    },
    {
      path: '/mall',
      name: 'Mall',
      component: Mall
    },
    {
      path: '/liveRoom/:uid',
      name: 'LiveRoom',
      component: LiveRoom,
    },
    {
      path: '/recharge',
      name: 'Recharge',
      component: Recharge
    },
    {
      path: '/zone/:uid',
      name: 'Zone',
      component: Zone,
    },
    {
      path:'/edit',
      name:'Edit',
      component: Edit,
      redirect:'/edit/infoEdit',
      children:[
        {
          path:'infoEdit',
          name:'InfoEdit',
          component: InfoEdit,
        },
        {
          path:'tagEdit',
          name:'TagEdit',
          component: TagEdit,
        },
        {
          path:'publicEdit',
          name:'PublicEdit',
          component: PublicEdit,
        },
        {
          path:'privateEdit',
          name:'PrivateEdit',
          component: PrivateEdit,
        }
      ]
    },
    {
      path: '/center',
      name: 'Center',
      component: Center,
      redirect:'/center/information',
      children:[
        {
          path:'information',
          name: 'Information',
          component: Information,
        },
        {
          path:'message',
          name: 'Message',
          component: Message,
        },
        {
          path:'favorate',
          name: 'Favorate',
          component: Favorate,
        },
        {
          path:'ward',
          name: 'Ward',
          component: Ward,
        },
        {
          path:'visitRecord',
          name: 'VisitRecord',
          component: VisitRecord,
        },
        {
          path:'packbag',
          name: 'Packbag',
          component: Packbag,
        },
        {
          path:'activity',
          name: 'Activity',
          component: Activity,
        },
        {
          path:'photoAlbum',
          name: 'PhotoAlbum',
          component: PhotoAlbum,
        },
        {
          path:'video',
          name: 'Video',
          component: Video,
        },
        {
          path:'customService',
          name: 'CustomService',
          component: CustomService,
        }
      ]
    },
  ]
})
