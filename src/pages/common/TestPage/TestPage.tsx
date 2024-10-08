// import { useContext } from 'react';
// import { BrandContext } from '../../contexts/BrandContext';

import BottomSheet from '../../../components/Global/BottomSheet/BottomSheet';
import { useBottomSheet } from '../../../contexts/BottomSheetContext';

export default function TestPage() {
    // const { skin } = useContext(BrandContext);
    const { openBottomSheet } = useBottomSheet(); // Get the function to open the sheet

    return (
        <div>
            <button onClick={openBottomSheet}>Open Bottom Sheet</button>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quisquam odio natus sed ipsam nostrum obcaecati sit officia eos sequi. Quasi rerum enim repellat, accusantium qui excepturi assumenda optio adipisci? Rem explicabo ipsam dignissimos. Architecto repellendus veritatis sequi consequatur voluptas, nostrum eveniet iusto vitae praesentium laudantium placeat mollitia dicta accusantium voluptates nam. Sed, minus id recusandae voluptas expedita sint omnis eius est doloribus, a aliquid in ex. Recusandae ipsa architecto cum at nam iure nisi, quaerat fuga dolor iusto nemo, quibusdam eaque dolore ut! Qui ipsam impedit eos voluptates dolorum consequatur est. Laborum, minima fuga! Soluta quae ab modi dolorem veritatis architecto dignissimos magni. Minus fugiat veniam consectetur velit quidem perferendis, architecto reiciendis illum voluptatem non commodi ducimus culpa ab debitis ad accusamus eius ipsa, asperiores soluta possimus corporis delectus porro deleniti. Exercitationem, nostrum quia voluptas nulla totam minus quas non. Quaerat corporis harum quibusdam sit, facere ipsa quae inventore enim consectetur suscipit sequi excepturi quisquam totam molestiae! Nostrum voluptate rerum quam deserunt optio, omnis illo cumque non labore dignissimos doloribus fugit nulla accusamus incidunt harum explicabo officiis. Accusamus eos iusto a, iure ipsa ut impedit quibusdam. Repellendus suscipit impedit reiciendis quia quo, expedita quae. Magnam eos saepe quod, rerum sunt, nemo nesciunt dolorum quis repellendus voluptates obcaecati similique eius rem ratione, odit atque tempore! Numquam veniam commodi aspernatur accusamus fugit? Natus nulla, accusantium ipsam, ea obcaecati corrupti maiores facere quia ratione architecto corporis, eaque alias veritatis magnam rerum pariatur minima quos ut consequatur illum sint esse provident unde ipsum. Fuga repudiandae quos est dolorem omnis reprehenderit numquam atque alias, ullam architecto similique, minima vitae quaerat! Ipsam nemo necessitatibus ad libero laborum, repellendus quibusdam fugiat maxime reprehenderit suscipit nam voluptatum quidem facere id, molestias repellat exercitationem itaque iure sequi quod, ipsa optio ab adipisci? Voluptate, voluptas, nihil maxime voluptatem harum minus natus fugit iste illum error omnis odio? Nisi, eos quis laborum velit quod maiores inventore explicabo similique alias sed eius doloremque culpa sit qui sapiente labore veniam ab excepturi molestiae accusantium nihil a quam modi. Aliquid, quod alias voluptas voluptatibus animi nisi. Sint corporis voluptatem delectus, sequi consequatur eaque architecto. Tempore beatae quis nobis repellat magnam porro doloribus aliquam laboriosam. Numquam ducimus dolorem doloribus incidunt quas saepe est voluptatem animi blanditiis ad debitis et iste aliquid, iure ea quibusdam magni, repellat perspiciatis obcaecati aut officiis. Ratione adipisci consequuntur, voluptas reiciendis aut deleniti consectetur neque rerum eaque dolor, totam rem excepturi!
          <BottomSheet
            
            title="Bottom Sheet Example"
          >
            <p>This is some content inside the bottom sheet.</p>
          </BottomSheet>
        </div>
      );
    
}
