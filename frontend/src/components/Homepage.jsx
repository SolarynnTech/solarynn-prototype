import React, { useState } from "react";
import styled from "styled-components";

const PageContainer = styled.div`
  background-color: rgba(255, 255, 255, 1);
  margin-left: auto;
  margin-right: auto;
  max-width: 480px;
  width: 100%;
  overflow: hidden;
`;

const StatusBar = styled.div`
  background-color: rgba(255, 255, 255, 1);
  width: 100%;
  padding: 21px 35px;
  font-family:
    SF Pro Text,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 15px;
  color: rgba(0, 0, 0, 1);
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  letter-spacing: -0.17px;
`;

const Header = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  min-height: 48px;
  width: 100%;
  padding: 10px 24px;
  align-items: flex-end;
  gap: 7px;
  justify-content: center;
`;

const Title = styled.div`
  align-self: stretch;
  flex: 1;
  flex-shrink: 1;
  flex-basis: 0%;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 22px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
`;

const IconGroup = styled.div`
  display: flex;
  padding: 2px 0;
  align-items: center;
  gap: 18px;
  justify-content: start;
`;

const IconImage = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 24px;
  align-self: stretch;
  margin: auto 0;
  flex-shrink: 0;
`;

const SearchSection = styled.div`
  background-color: rgba(255, 255, 255, 1);
  display: flex;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  overflow: hidden;
  align-items: stretch;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 16px;
  color: rgba(191, 191, 191, 1);
  font-weight: 400;
  line-height: 1.3;
  justify-content: center;
`;

const SearchForm = styled.form`
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
`;

const SearchInput = styled.input`
  border-radius: 12px;
  background-color: rgba(249, 249, 249, 1);
  border: 1px solid rgba(186, 186, 186, 1);
  z-index: 10;
  padding: 16px 24px;
  flex: 1;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  outline: none;
  color: rgba(0, 0, 0, 0.8);
  
  &::placeholder {
    color: rgba(191, 191, 191, 1);
  }
`;

const SearchButton = styled.button`
  border-radius: 12px;
  background-color: rgba(8, 123, 67, 1);
  border: none;
  color: white;
  font-weight: 600;
  padding: 16px 24px;
  cursor: pointer;
  font-family: Inter, -apple-system, Roboto, Helvetica, sans-serif;
  font-size: 16px;
  
  &:hover {
    background-color: rgba(7, 100, 55, 1);
  }
`;

const SectionHeader = styled.div`
  display: flex;
  min-height: 34px;
  width: 100%;
  padding: 0 24px;
  align-items: center;
  gap: 10px;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  line-height: 1.3;
  justify-content: center;
`;

const SectionTitle = styled.div`
  color: rgba(0, 0, 0, 1);
  font-size: 18px;
  font-weight: 700;
  align-self: stretch;
  margin: auto 0;
  flex: 1;
  flex-shrink: 1;
  flex-basis: 32px;
`;

const ActionButton = styled.div`
  align-self: stretch;
  border-radius: 16px;
  background-color: rgba(245, 245, 245, 1);
  box-shadow: 0px 1px 1px rgba(0, 0, 0, 0.25);
  margin: auto 0;
  padding: 8px 16px;
  gap: 4px;
  overflow: hidden;
  font-size: 14px;
  color: rgba(8, 123, 67, 1);
  font-weight: 600;
`;

const ScrollSection = styled.div`
  overflow-x: auto;
  display: flex;
  margin-top: 16px;
  width: 100%;
  padding-left: 24px;
  flex-direction: column;
  overflow: hidden;
  align-items: flex-start;
  justify-content: flex-start;
`;

const ImageGrid = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  justify-content: flex-start;
`;

const FavoriteImage = styled.img`
  aspect-ratio: 0.67;
  object-fit: contain;
  object-position: center;
  width: 200px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const PlaceholderImage = styled.div`
  border-radius: 10px;
  background-color: rgba(233, 233, 233, 1);
  display: flex;
  width: 200px;
  flex-shrink: 0;
  height: 300px;
`;

const SquareImage = styled.img`
  aspect-ratio: 1;
  object-fit: contain;
  object-position: center;
  width: 150px;
  border-radius: 10px;
  flex-shrink: 0;
`;

const CategoryGrid = styled.div`
  background-color: rgba(251, 251, 251, 1);
  display: flex;
  width: 100%;
  padding: 24px;
  flex-direction: column;
  overflow: hidden;
  align-items: stretch;
  font-family:
    Inter,
    -apple-system,
    Roboto,
    Helvetica,
    sans-serif;
  font-size: 14px;
  color: rgba(0, 0, 0, 1);
  font-weight: 700;
  justify-content: center;
`;

const CategoryFrame = styled.div`
  min-height: 100px;
  width: 100%;
  overflow: hidden;
  margin-top: ${(props) => (props.marginTop ? "12px" : "0")};
`;

const CategoryRow = styled.div`
  display: flex;
  width: 100%;
  align-items: stretch;
  gap: 12px;
  justify-content: flex-start;
  flex: 1;
  height: 100%;
`;

const CategoryCard = styled.div`
  border-radius: 10px;
  background-color: ${(props) => props.bgColor};
  padding: 12px 12px 67px;
  overflow: hidden;
  width: 167px;
  white-space: nowrap;
`;

const Navbar = styled.div`
  padding: 18px 24px 8px;
  justify-content: flex-end;
  align-items: stretch;
  box-shadow: 0px -1px 25px 0px rgba(0, 0, 0, 0.05);
  background-color: #fff;
  display: flex;
  width: 100%;
  flex-direction: column;
`;

const NavMenu = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 40px 73px;
  justify-content: space-between;
`;

const NavItem = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  aspect-ratio: 1.548;
  width: 65px;
  padding: 0 13px;
  overflow: hidden;
`;

const NavImage = styled.img`
  position: absolute;
  inset: 0;
  height: 100%;
  width: 100%;
  object-fit: cover;
  object-position: center;
`;

const NavIndicator = styled.div`
  border-radius: 100px;
  background-color: rgba(0, 0, 0, 1);
  align-self: center;
  display: flex;
  margin-top: 24px;
  width: 135px;
  flex-shrink: 0;
  height: 5px;
`;

function Homepage() {
  const [searchQuery, setSearchQuery] = useState("");
  

  return (
    <PageContainer>
      <StatusBar>9:41</StatusBar>

      <Header>
        <Title>Welcome Denzel</Title>
        <IconGroup>
          <IconImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/2bb3e418724b26b939a25b9826e4e46a0924b12a?placeholderIfAbsent=true" />
          <IconImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/05970884abba15fb0e299609b4b61fe55b73235e?placeholderIfAbsent=true" />
          <IconImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/cbe8e0eb7c05c32e8f5365d7205e27f161819ee8?placeholderIfAbsent=true" />
        </IconGroup>
      </Header>

      <SearchSection>
        <SearchForm>
          <SearchInput 
            type="text" 
            placeholder="Type here to Search" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchButton type="submit">Search</SearchButton>
        </SearchForm>
      </SearchSection>

      <div css={{ width: "100%", padding: "24px 0", overflow: "hidden" }}>
        <SectionHeader>
          <SectionTitle>Your Favorites</SectionTitle>
          <ActionButton>See all</ActionButton>
        </SectionHeader>

        <ScrollSection>
          <ImageGrid>
            <FavoriteImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/7c1ebc8aa11b5e439737173921ab1ae66ce4147a?placeholderIfAbsent=true" />
            <FavoriteImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/c8c23f7cf36769568332551a552b059be67c73f8?placeholderIfAbsent=true" />
            <PlaceholderImage />
            <PlaceholderImage />
            <PlaceholderImage />
          </ImageGrid>
        </ScrollSection>
      </div>

      <div
        css={{ width: "100%", padding: "24px 0 24px 24px", overflow: "hidden" }}
      >
        <SectionHeader>
          <SectionTitle>Recently Viewed</SectionTitle>
          <ActionButton>See all</ActionButton>
        </SectionHeader>

        <ScrollSection>
          <ImageGrid>
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/2b834df30a62fbbf9b4e45b7544e24017cd7b332?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/05263f58fb681fc09cd6629eb33f712ff46f406f?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/2374068382a90ef0ffff70f8f76c2d5cec3e2baf?placeholderIfAbsent=true" />
          </ImageGrid>
        </ScrollSection>
      </div>

      <div
        css={{ width: "100%", padding: "24px 0 24px 24px", overflow: "hidden" }}
      >
        <SectionHeader>
          <SectionTitle>Your Connections</SectionTitle>
          <ActionButton>See all</ActionButton>
        </SectionHeader>

        <ScrollSection>
          <ImageGrid>
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/0747301a2b1e924293e6065ddbcab062cde89b49?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/4133ca3b3b5d03e4b480cfe49a8fb82653ac4a0c?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/81b8aee818e273c503e53ba61311fe17256804c0?placeholderIfAbsent=true" />
          </ImageGrid>
        </ScrollSection>
      </div>

      <div
        css={{ width: "100%", padding: "24px 0 24px 24px", overflow: "hidden" }}
      >
        <SectionHeader>
          <SectionTitle>You Should Have A Look</SectionTitle>
          <div
            css={{
              borderRadius: "18px",
              backgroundColor: "rgba(245, 245, 245, 1)",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.25)",
              alignSelf: "stretch",
              display: "flex",
              margin: "auto 0",
              padding: "8px 16px",
              alignItems: "center",
              gap: "4px",
              overflow: "hidden",
              fontSize: "14px",
              color: "rgba(8, 123, 67, 1)",
              fontWeight: "600",
              whiteSpace: "nowrap",
              justifyContent: "center",
            }}
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/TEMP/2e7a83f91d967893173507fd14635fdb603437d7?placeholderIfAbsent=true"
              css={{
                aspectRatio: "1",
                objectFit: "contain",
                objectPosition: "center",
                width: "18px",
                alignSelf: "stretch",
                margin: "auto 0",
                flexShrink: "0",
              }}
            />
            <div css={{ alignSelf: "stretch", margin: "auto 0" }}>Shuffle</div>
          </div>
        </SectionHeader>

        <ScrollSection>
          <ImageGrid>
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/145f2808fb5e569d0e06e3b83f59926bba512279?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/8fa1af31a840884c268b7183b70bf8eb4bbf64cc?placeholderIfAbsent=true" />
            <SquareImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/81b8aee818e273c503e53ba61311fe17256804c0?placeholderIfAbsent=true" />
          </ImageGrid>
        </ScrollSection>
      </div>

      <div
        css={{
          backgroundColor: "rgba(251, 251, 251, 1)",
          display: "flex",
          width: "100%",
          padding: "24px",
          alignItems: "end",
          gap: "7px",
          fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
          fontSize: "22px",
          color: "rgba(0, 0, 0, 1)",
          fontWeight: "700",
          justifyContent: "center",
        }}
      >
        <div
          css={{
            alignSelf: "stretch",
            flex: "1",
            flexShrink: "1",
            flexBasis: "0%",
            minWidth: "240px",
            width: "100%",
          }}
        >
          Our Universe
        </div>
      </div>

      <CategoryGrid>
        <CategoryFrame>
          <CategoryRow>
            <CategoryCard bgColor="rgba(242, 151, 151, 1)">
              Public Figures
              <br />
              <br />
            </CategoryCard>
            <CategoryCard bgColor="rgba(166, 187, 243, 1)">
              Fashion Brands
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(208, 132, 214, 1)">
              Media / Publications
            </CategoryCard>
            <CategoryCard bgColor="rgba(174, 243, 181, 1)">
              Industry Experts
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(245, 191, 109, 1)">
              Companies
            </CategoryCard>
            <CategoryCard bgColor="rgba(194, 229, 255, 1)">
              Entities
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(248, 113, 178, 1)">
              Agencies
            </CategoryCard>
            <CategoryCard bgColor="rgba(94, 236, 142, 1)">Events</CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(255, 236, 189, 1)">Shop</CategoryCard>
            <CategoryCard bgColor="rgba(140, 157, 247, 1)">
              For Sale
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(155, 252, 211, 1)">
              Book Talent
            </CategoryCard>
            <CategoryCard bgColor="rgba(232, 240, 150, 1)">
              On Loan
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>

        <CategoryFrame marginTop>
          <CategoryRow>
            <CategoryCard bgColor="rgba(225, 197, 164, 1)">
              Gift it
            </CategoryCard>
          </CategoryRow>
        </CategoryFrame>
      </CategoryGrid>

      <Navbar>
        <NavMenu>
          <NavItem>
            <NavImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/6bef1f5c-fa54-4ae9-927b-abfd6bd4046c?placeholderIfAbsent=true" />
            <div
              css={{ position: "relative", display: "flex", minHeight: "42px" }}
            />
          </NavItem>
          <NavItem>
            <NavImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/63e2cf00-e91e-41ab-80cd-1da1f4e1705f?placeholderIfAbsent=true" />
            <div
              css={{ position: "relative", display: "flex", minHeight: "42px" }}
            />
          </NavItem>
          <NavItem>
            <NavImage src="https://cdn.builder.io/api/v1/image/assets/TEMP/02287314-22b5-4a29-b8fa-8447ef460447?placeholderIfAbsent=true" />
            <div
              css={{ position: "relative", display: "flex", minHeight: "42px" }}
            />
          </NavItem>
        </NavMenu>
        <NavIndicator />
      </Navbar>
    </PageContainer>
  );
}

export default Homepage;
