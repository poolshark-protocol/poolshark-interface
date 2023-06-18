import '../styles/globals.css'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { arbitrumGoerli } from 'wagmi/chains';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import Head from 'next/head'
import { useState, useEffect, Fragment } from 'react'
import { useAccount } from 'wagmi'
import { ConnectWalletButton } from '../components/Buttons/ConnectWalletButton';
import { Analytics } from '@vercel/analytics/react'


const { chains, provider } = configureChains(
  [arbitrumGoerli],
  [
    jsonRpcProvider({
      rpc: (chain) => ({
        http: `https://arb-goerli.g.alchemy.com/v2/M8Dr_KQx46ghJ93XDQe7j778Qa92HRn2`,
      }),
    }),
  ],
);

const { connectors } = getDefaultWallets({
  appName: 'Poolshark UI',
  chains
});

const wagmiClient = createClient({
  connectors,
  provider,
  autoConnect: true
})

const apolloClient = new ApolloClient({
  cache: new InMemoryCache(),
  uri: "https://subgraph.satsuma-prod.com/3eaf484773f9/poolshark/cover-arbitrumGoerli/api",
})

const whitelist = [
  '0xCda329d290B6E7Cf8B9B1e4faAA48Da80B6Fa2F2',
  '0x465d8F5dB6aBfdAE82FE95Af82CbeC538ec5337b',
  '0xBd5db4c7D55C086107f4e9D17c4c34395D1B1E1E',
  '0x4ED5f34cf458f0E2a42a514E1B1b846637Bd242E',
  '0xaE312276Ea1B35C68617441beddc0d0Fd13c1aF2',
  '0x39e9259Aa9d1bf05f5E285BE7acA91Eefe694094',
  '0x34e800D1456d87A5F62B774AD98cea54a3A40048',
  '0x1DcF623EDf118E4B21b4C5Dc263bb735E170F9B8',
  '0xF2bE526eE1242C0e9736CF0E03d834C71389A4c7',
  '0x1b5e17110463b3a2da875bc68934EB5137A4f6f4',
  '0x20A13F1e2638c9784a031F291943b2A87B3f12A6',
  '0x69e8e23Eb2e61BC8449e02Ced7075186DAFBcFc1',
  '0x5bcb86339f2B53CA52EdAdc4C692199a78f06E71',
  '0xFb408FA20c6f6DA099a7492107bC3531911896e3',
  '0x4fd787803dB60816F16B121cC7c5637263f1736f',
  '0xD9b930b96A7390615648d5916E74D37E350AC40D',
  '0xB7b60698a41e2375A700a37A46fFCEE42c202c13',
  '0x0482d6bF3B83470ee4eE87C20a98d38249138e1B',
  '0xe131efec92FfB719151aCf52FC1955BcA2a3e19f',
  '0x9A77b37401F162062e8F85889B13910dBDbb9843',
  '0x9944acB1c5c90709896A8442D3b9b8cb09633B6C',
  '0xe017F324E7e7027775696200bF622Aa40948B381',
  '0xA3712033923258Ff2de8b19d3742b0CEFb3F561A',
  '0x98b4a5805851EAf4BbBFe4b61A2cAe578287D1B5',
  '0xDd4610E646fA595a8cad5b71Cfe3489175D952a9',
  '0x35E3a5f9A59A441f5b87416eD68eb99753e59171',
  '0x9219e2778E0FAc0E59010157386f9c930CB25ab6',
  '0x1F2e8e34387a82F153B38FEfB3055B2bD2b8c5C9',
  '0xe2894FD6cA974d7d248010Ac0Fa98eaA27Ed790A',
  '0x716F45e95B033F06a79444B87005F87b1844f00E',
  '0x439fc347A360d0C9fdA70F9F4f2558B78c5f27ab',
  '0xF9868b3960348194371B8cA4Fe87Ca7DE95e40b6',
  '0x0254D20a1f6062709d82CdF358A3DD9664A80520',
  '0xAe7e2AA76f463Ca04812906F9c8C3D870704bD8D',
  '0x2838032d8FbE767f86c3C5a300e2B379917A3476',
  '0xAC3405F38cf6F1B7f8Dd72acec69568CC61073e8',
  '0xAa55b4B10c1fc93CC0799d25f0A95bBbdfC3f093',
  '0xC779fc833fe9732929660e3BCD86ce7508ec4173',
  '0x02770a497b01857050EA14884848BAB64C46f9a4',
  '0x8149DC18D39FDBa137E43C871e7801E7CF566D41',
  '0x081Ea225fB53925331F1c87F1b64DAF960837799',
  '0x82D87684E0B69492F47EaD7D5716292Da2f108b5',
  '0x74A5B346F2cccf06e2127EB6680389E7D8953c80',
  '0x164E3e9A48f10A83487eee1336432a71EA788e75',
  '0xc0C44b69d91eA0B26f5BE8aFeDC18a8cEe281aD7',
  '0xceA4776339AeCFc533DEB6Cd6543a35013981E9D',
  '0x357A15f1D5feFF777fB38Ec5424cC2605C091fb8',
  '0x565D380416a2889b817C6Eb493f6DeeF029212Aa',
  '0x8847EBaaf29A18396e49191602f8d8D141b98aa7',
  '0x49908012C864818E7E7Af55d085afD1efa19B0FD',
  '0xdbDd37c697fB9a8f561583BDc081EACC4b1b656e',
  '0x21Bd44D81DEf1187aa5E64239c6AcEE978602d2D',
  '0xc0A736fc46578a9D0CB5595f19035DA934755caC',
  '0xF8bb9FaFD6aa9813De38C2F535d4Ef0758a89eBB',
  '0x214C297b732987cd80c6956ff8e02651468C7ba9',
  '0xEF56F3D68ef19e48c367dB3E04B6AfFcE61d2981',
  '0x14b49f51C711A908dc1cBAf9dd65D19263011224',
  '0xAfa58bef8fC6ac24c2b03BF076B79d1BCbb53E54',
  '0xAE26E52d785fcd3a7DAB7237c00Dcc69D1ff759C',
  '0x4789f8ED86858dd6879104781293A98569B46b16',
  '0xB3A94E75E6acF3fF25C9aff0E3Bfd172d9FcB23D',
  '0x7df36e9cd1827c13a4E281d956D8c86749666666',
  '0xA8Ef8b6A369Cf07f2bac69e7A130EDd4dD581Dc1',
  '0x6001D26436986706Ff19c35478F97e0c43846470',
  '0x65f853B6624e8Ef6be6F4b2490A5d62fD711E43D',
  '0x506685ad6E1D208d37547FD8d10a9124444251aC',
  '0xaB12C42629c03e10627FC3bf4F4571FF2Ac828c0',
  '0x58C4f03a954e4CbB1b8E204a881a8e9A99d015Dd',
  '0xD7c25D21810D1AC89a65aC20Ed88Dc70CCE43345',
  '0x5646889144dbb12fCdfF5d644B5B44e7E5a89ACC',
  '0x60C750e77b17613FA2D80035C894FB05d6F7dE66',
  '0xAAB4670ed9DdAca6008CD47A8b9f378f7d7d9b3C',
  '0xEcb2362D68B1b4EB6b54bC8a3B686fCE5c130130',
  '0xA2AE8C2c6a454070033587DE1a65EF8556B84e30',
  '0x2bEae9F24b0E70F070371993Acaf31ebec92f66D',
  '0xAD9e993b3f51D6a75189aBeD6C4757bAC613D447',
  '0x23d2deEB7Eb41609aCE88836358ffE4015fBa0A3',
  '0x7e0A6F814a57e1919F60525294d834b7532476A4',
  '0x9f7b54d3a53C970A94AeaB5281faFF36b9ae4250',
  '0xB34a872A5A1a19bD5B9EFE9A90f35586C4EE6077',
  '0xDB77fe908933A740549b92A8660D5a445050C895',
  '0x7a87FA0C587F71e4d8Ad4E4A11Ef0CF901Af6F86',
  '0x9C72AF18fCB47203D498e568541cD74AA51815d6',
  '0x712fB5180a12CD7DD620E6942b99E67196D79Eb3',
  '0xC182aA0ecb24A674C00C76cE8F1761cC5a10611c',
  '0x80e8F1B5e35b41d2Cd3F83b2575E0EcB884D7a8A',
  '0x47826fcb8f7d6C5687F7C812179bD2fa06D946d1',
  '0x4f82e9E6065A194292eCA1c294C45c63e8ABbb60',
  '0xd1134FA050a43BaF71Fed6F4079F2b75eE249Ebc',
  '0x227FDFA59688DfA93fB3CC8FF90FB1bFB36BDe53',
  '0xa5BeF30C81AF261d3156013dd7C6cb1779d0113F',
  '0x992C57C113175d0dc979837de9BDabfEc6d418f3',
  '0xD111886cb7eFF60F390E8F4C4F7c288C21988d51',
  '0xc5de8C6dbc7BEE4D054C62981D28963c6A783dD9',
  '0x0d3485E1342Ea62b34F65bE011486953c8b3BE32',
  '0x2422F2caF7fA802b7edd3DBE916dAFDa87838503',
  '0xE37D1c5ec119Bde0Bed4B44313249581D1D12Ce3',
  '0xF5857724D9006613F6f9587ceE20d02A0Bb75d53',
  '0x2d3a3F51Ac7E6462a58A7eD245b893e0bd0509d3',
  '0x9176Bab11b30c1d169FcE8EAb1a0006CaC01e334',
  '0xA025cDf80b2474762987CBD727c70539b252918B',
  '0xB5A7C23fFCb8E99C088eabDE7d73Fe696E45C9C5',
  '0x0797FC6d6f3762D33728E0Eeb9C82dd301F3467b',
  '0xf5073937079Dc9a0011be36DBe50D721E08A8345',
  '0xda9695b6169CC7C905a2B9bC54495DB83bA97752',
  '0x99AacDB295c6d6fae1D5c0f01a469430cf58E021',
  '0x57A1E599530a3E6bf4EE2e063c18DCc4388D9cC3',
  '0xa7f96035556989D497cF595067A3fBCC0C03829B',
  '0x1dDAd68cd5357a0616878e27908C216c26116ecb',
  '0x582C52Ea66c513203641dC64b3059b6b3735B315',
  '0x7F3991732932549c0fA9A2e25B1CD558c6810e5E',
  '0xcDF33a991B66811cD25a42b7887FceAc776CF0c8',
  '0x310017692089F8cbb197889e8364E1e956fAcA14',
  '0x9Ce8321f55E4D25216956FB23dfD636e38740581',
  '0x0365566ef442e63ea7E6905AFDE6bB749c845fA6',
  '0x86fA9a2b77d735DD99269d687B5377930D0f0e6E',
  '0xF42b51CC6E2849c136Ea11e6304fcD8654E92fA0',
  '0xd6D7C1C2ade9BBb59a39Ff2697724af7b0EA65C0',
  '0x924f20AadE633A6CD06807988C1ac687f26fE5E8',
  '0x221Cc362292054b022Ef9227F8A03Cb33441Ad58',
  '0xbDFBECf4600101D4AB18d2c996Cc5CfD7C68d40c',
  '0x5aF58F280e51fc99aC1011B093116A097be28bd7',
  '0x6DB9e7F63FC34a5727bb54dc7ac487ACb23Dc44A',
  '0x7361367599AAa8c987159d216c87270ccddB4Ec6',
  '0x467F905bc744c252E4BCB0e0f29D93b0A668f068',
  '0x868d923A54c9B4773F4A95446E5222D4ea45e985',
  '0xe93e0fe03dcEd42df5F3bf827f34AB5ea0dB997F',
  '0x37873E40c4B8b327eaf8284Fb9227E351aa07Fa1',
  '0xe0f8B001263C84e014AF15e1dB3DBDa5DFF6Dae5',
  '0x8D52d8e2791CE7b942DE48be7b35628b8C249D65',
  '0xDf7B565bA908584a8967fC9aa43c79662BF0A213',
  '0x193F24bb16d4051938f3586BCAE7532a7dCb0E25',
  '0xCA33c9351674Ae7dB448FB15626782E53Bf21A93',
  '0x183DdFdea7a7bc6Cbb797f013A73498cF2e5470b',
  '0x067c3D0E260b282836904C1eEB6302d9F72c3Ed6',
  '0x03a2a1FFa1F132118C2888CCfd9e39Bfa2453E08',
  '0xDA675a9888e16595C66C6c1DA684dF4e26f8aB69',
  '0x5D8433D503861BdA143638D9D275A4FB7D279B1B',
  '0x9DDb50f7e09D95E52565B02029AB7E33eE5503E5',
  '0xc967670cffcb97d0A20dcbC27316685e8d026ec1',
  '0xCa2A59A26dDfd56C69e3465DF66ee2986B4B0F4a',
  '0x8A2FA09530F858D2B064d5539aa755E8b901033a',
  '0x2e403B969a64BdD1CA18fE10BABA4546957bc31e',
  '0x63754677A2EE99A140e85eD93EB6Bb5a0CFE665B',
  '0x27B4683865cA545c75CC1454E93f955D1133Ac37',
  '0xc62D493F1dCdE015192D4E64d907b34666eD1AF2',
  '0xb7464007c6c9cBc6A605cFC26801171e1598da10',
  '0x661bd9e8e534c7D1CD9C7A30acb5C5f2D0647231',
  '0xA0AAC6E4BD2Cb5Bf9512e8D501294f20D30FFa8B',
  '0x9D288eaDd5fe3f6737233F5644F6F6da533Ea71B',
  '0xE134EC21869D66258C315A04966dFc1eeAfE3BF6',
  '0xBCF1780CaE77fDB0D40dE1fe99D70932CEbb7871',
  '0x17Cbd2Bd694847Ee75Afb803aa512bbb51168f4e',
  '0x01909c12E60BF3aF76071FEc7956842b90420D6C',
  '0xf85a6BBe8D4c720E0524EBf943ad079C219422c0',
  '0x1df869cFac0B7377F773E904ee14470BDbA5f90C',
  '0xEa3E6593569cfbF3f748570768C5e58216539017',
  '0x8B6A8E3845752B97521b45fdd946918171d6A1eA',
  '0x04d04C019dA3b971928e53847e9c4bbbdE82D96e',
  '0x14c2c66F50e4DD6DD10cccBCc105a2E7467287E5',
  '0xEfA117fC408c83E82427fcc22A7d06302c542346',
  '0xd319f112bf73eAe5e3cf06bF8D4076cC5f8B1cD5',
  '0xA10fFEB0E0FFcd2846d4ec1B93a71fE1e7836827',
  '0xE8b1Be5c7d91A6b59663fcE14D81AfBe6969C0B3',
  '0x76F7cb9dc093B69c1b0ae9eb573a66352DdC2316',
  '0xF0081E6D6f3719C547f37d1073eE6B9D35954dD4',
  '0xadD993Df71e526eE46ed5c3eA5f4a6A048ABD91D',
  '0x99cbb48aEBe524f99750028B2A458fBA9675f6b5',
  '0xdCe4A80B727EEF74BA74C8D1Ed32F86DbcFAf492',
  '0x5c236ADf1fb675E5BE1124A81e640e94D5865ba7',
  '0x213878493fCc2c97788aBB290504B0503c4d97CD',
  '0x7a09083C848A3637aff552093eC6cC3d9f0254Dd',
  '0x5D2A82441149D36117b88DF474bf6888CA4BE7EE',
  '0x2F09e22956BbaF5853fcae17E72Ed82090BC5583',
  '0x1C7d984d7f70de7BeDa8C9628116D819bc79C499',
  '0xdB10Bd35Ff6977eF248aa70d05D38DBdd5d6FD00',
  '0xeb0A7BED984babcd387722bDb43a4Dc599fC509b',
  '0x0e5E3655105d04251dCdFec5b75d34d937cdc20F',
  '0x721Bba99b2D83bC267A3419Aa4303cab8B3f8Dc3',
  '0x7fc9851e53fA7d7792836AeF35e294a1168fEA01',
  '0x2Eec5DBd5c07908635fdbe1af331ac191a666666',
  '0xc738315eC605e0fd302d6e91e185636d2D07F68b',
  '0x1a994F76ADDF9ef5eC5914899F7337d2b1314520',
  '0xf4989D7d81983Fd3E69f32cd4Fb71Bd1Ca34EDf2',
  '0x52B0c756d6f36af804C51211BD5A1fA4AB5dc911',
  '0x5725Acf7CB10cc79987FeC761EF4a4259cD0951E',
  '0xD9b930b96A7390615648d5916E74D37E350AC40D',
  '0xe131efec92FfB719151aCf52FC1955BcA2a3e19f',
  '0x9A77b37401F162062e8F85889B13910dBDbb9843',
  '0x9944acB1c5c90709896A8442D3b9b8cb09633B6C',
  '0x09193b7D0433b663ABc2c345eBa1c39d01d9e2a5',
  '0xf997558AE6aB4e5b7DF35B6686becf512A50202c',
  '0x101dF0ae91C566DFbdA67a894710073873C0a0C0',
  '0x6ea24f3cDDDF5B88F90B73A2d7df7ad9C0f9BEC4',
  '0xee85ab40aC1159A8700841e921b542d768265D4D',
  '0xd561E4536E17eBcb6FC2F4Ff6446C1eE3E6Cf779',
  '0x1Fc550e98aD3021e32C47A84019F77a0792c60B7',
  '0x05DcAa0657A159291Bdd5b4E2F0514DF4FBC9fbf',
  '0xEDd8e363a74D597f98f14691f9A9ab85298efFbE',
  '0x2C486FF22Eb0A2bA98E26C93bd3fBAFAa7E4CB3B',
  '0xe4631B72336A6e6dD5F8264a82dB62BfB1cDa09a',
  '0x2084e6c85470191867441Ba5138BD0069E3d02E1',
  '0xceA4776339AeCFc533DEB6Cd6543a35013981E9D',
  '0x7093773263BEf4D7ED327f9D2104177bdbfCF7b8',
  '0x9A2b09c6B6f3fE2536Af06550E739E002749fb5E',
  '0x443C4cEffEbbd742DaAC8B14aC90EEba6520fE6F',
  '0x75c1e14cD2D114686bd5B765Fcfe376176E41F1F',
  '0xa68aB6d6668745c4585667aE4a91c0032dBb932f',
  '0x6a93693b70022b1d0D21E3ca4436dc748472367f',
  '0x22Bd8C518fe4C79112C2Cc1aC664297941CDed5D',
  '0x9d50771e907b0553c432F02B9e98Fd1B7e87E004',
  '0x12e6B7C051b7F83a3485602aBD96083d2027BBbC',
  '0x064b02d169765880489a5713EF0d247C46c2C24C',
  '0x211E805073A45e05BE386f61545c14864307b63F',
  '0xd4dC837D2cB27ba32b2941999e2ECFcbCA1DfFA5',
  '0x12b5943104b11033BbE198Bf24EdC55c514E0842',
  '0x4077119807193D1454F8302B39d59DAfad16eB63',
  '0x20f6f2EED443338D5B2fb219F0209e50Afb0f29b',
  '0x37ddA20cF986221eD0C94ddE60F39cf8cAcaf8F5',
  '0x3AafdfbeEAc9D04Ef2b9C60daAA330DbEB62406c',
  '0x41A35610c3D34b7B05340321Cb47d986e272A018',
  '0x5Be9B181938272B7F6A10e6a3bf8e98cDD58Db46',
  '0xd420Dd7Cc3bc9C116856DC8976db74936211fe19',
  '0xBC0190Ee0a0B62baB4e25BD67B47670aC9198f17',
  '0x0f89eCfCce7a9Ab9C35f2fd3d1c612Ac30c56bE6',
  '0x581b0fa7e8c9681D7f4bc6D38a29A4fFf4b41bAd',
  '0x3f63142a3B97fbA8Ef095E09421D6575e092B63f',
  '0xF7e8cAeFa7A22999AA7a2DFe7bE570DbB341afB1',
  '0x03CE28D064cBFAcD218E37481AfC4606FcB518B4',
  '0x2be1a753b1c0562c4cf35A24F6f62619961CEB53',
  '0x99AacDB295c6d6fae1D5c0f01a469430cf58E021',
  '0x2Af4b96fB69DC868eCd385865501460611AEaC4C',
  '0x5866D07A1b9ac4fb62c732e27528206C4Ab78847',
  '0x423a723057b6fc160C5186Aa3c536C6ba542245c',
  '0x91Ef2EaA17CddFE1b80369dEA2EdefC15B43Ee94',
  '0x21A25619AaBb94E7c0cB2cDe94bFAEAD5972D903',
  '0xB3ae1b0DA9Ca1D491C5565a300f044b3B793ca84',
  '0x975DD80A91CC58b02a08e3E45198bfBEB780e4D1',
  '0x580b19f489f61903E48B530A87E498b0d12Ed4E1',
  '0x14152B9F77c31450F8999F99201c646C8bC6474F',
  '0x549287e6465428408Dac7C5fB0c106DBFF1EfE85',
  '0xE3C45556E475BdaD68736aE12Dd9D31be935DC6e',
  '0xc3fCf5DaEE8Ba9B4F637a5CeDE4aAb474b00435A',
  '0x69cE615548099bFc941a836E315d4B9C93b44B88',
  '0x99A638f94599CEbfCd6CD3D9a2e18CA0B37c54FD',
  '0xb799F595E95C45547D308DF1B3fE2fec4E157e51',
  '0x45B6c107DF4a01eF2AD028aa0327140648956D8c',
  '0xf1FFF06d36db2028449Cf814EFa7E96F4FD48171',
  '0xf70F0D21471C205E51492970D784dF42B0a94E97',
  '0x573aDaD94A5d502E14A772488Dea8FBf30ECd47E',
  '0xeaA2FDA8509d32546b2F561A75a5BADA8B1dB27a',
  '0x49c643CAcdc9C0163c69B52b583eFa2F2A22Bf30',
  '0x69f134764ba16439Eb8aaf316CB97DdB5a694Ae8',
  '0xe9b1676E292b575df5061DA6E5499C38E2Cad08A',
  '0xedf9aAcFBde1E0FaDAaecB8122eDd61b10697816',
  '0x4dDbA3e9b3845CF08C17d8e3b210Daeae6e0CA7D',
  '0x6Ea7965B6e64045f0b709C50383B23eb03AD5B9C',
  '0x15f95c5238c1ddf70cc89c6735ed9d02Cc1fa780',
  '0xCa2A59A26dDfd56C69e3465DF66ee2986B4B0F4a',
  '0x548d9422e865cf782c6485D175F3B9AD4D34643C',
  '0x8A2FA09530F858D2B064d5539aa755E8b901033a',
  '0x1268Cf793345Fc6ac231601a7e25F38219796caC',
  '0xA29BD81A48AF6976E50F8fe2cE2A94D704a2F36C',
  '0xfABBdFc4d456b53B0118E3843cfd4AeA7c228Ae3',
  '0x2DB7d887e17507A5e25e2F05dA6DecfaCedD7389',
  '0xA4666eA5CB0c088E7B7ca1bb808a27a22E8290A6',
  '0x65B668B6Ca86c024b96c439e2c1994636fAd68CF',
  '0xd2fd4cAa051090867E669778A30e3083f78a2817',
  '0xCECd24749Fd698604BC9231AcddDeC6e1268c8a5',
  '0x1aEC89FF6C0B418BCeEac6F59579f8f0FEEDE6CD',
  '0x89feD6D92D71314610F187eCf5ef66651C140baf',
  '0x2a860633Cd7a9371DEC13C0c559BF62ceDdc01dD',
  '0x51eB8e19e49cbE0Ef43701DF966E936D2f0Fcdb0',
  '0x3c6DfB5D608c4849d289d81d8bfcCBD48d86d0a8',
  '0xea79667DBC715C7a319b72dCA26E26ec3743C1ba',
  '0x2D5169b0Db2c8e612D8B4C45eB34F99735010D2d',
  '0x2e403B969a64BdD1CA18fE10BABA4546957bc31e',
  '0x7D0B968AC57ccB18DC481535601308De506ffeFD',
  '0x32e01149f656f6062168Ea437a3E3192fd669c8c',
]

function MyApp({ Component, pageProps }) {

  const [whitelisted, setWhitelisted] = useState(false)
  const { address, isDisconnected, isConnected } = useAccount()

  const [_isConnected, _setIsConnected] = useState(false);

  useEffect(() => {
    _setIsConnected(isConnected);
  }, [isConnected]);

  return (
    <>
    <Head>
       <title>Poolshark</title>
    </Head>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitProvider chains={chains} initialChain={arbitrumGoerli}>
          <ApolloProvider client={apolloClient}>
            { _isConnected ? (whitelist.includes(address) ? 
            <Component {...pageProps} />
            : 
            <div className="min-h-screen">
            <div className="max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-56" />
                <div className="text-white text-center text-lg mb-10 ">
                Poolshark is currently under a closed testnet beta. You must be whitelisted in order to access the platform.
                </div>
                <div className="mx-auto text-white text-center">
                <ConnectWalletButton center={true}/>
                <div className="mt-5 text-grey">
                This wallet is not whitelisted
                </div>
                </div>
                </div>
            </div>
          ) 
            : 
            (<div className="min-h-screen">
              <div className="max-w-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <img src="/static/images/logo.png" className="mx-auto mb-10 w-60" />
                <div className="text-white text-center text-lg mb-10 ">
                Poolshark is currently under a closed testnet beta. You must be whitelisted in order to access the platform.
                </div>
                <div className="mx-32">
                <ConnectWalletButton/>
                </div>
                </div>
            </div>) }
            <Analytics />
          </ApolloProvider>
        </RainbowKitProvider>
      </WagmiConfig>
    </>
  );
}

export default MyApp
