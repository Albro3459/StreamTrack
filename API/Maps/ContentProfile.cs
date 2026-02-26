using AutoMapper;

using API.Models;
using API.DTOs;

public class ContentProfile : Profile {
    public ContentProfile() {
        CreateMap<ContentDetail, ContentDetail>()
            .ForMember(d => d.Partial, o => o.Ignore())
            .ForMember(d => d.Genres, o => o.Ignore())
            .ForMember(d => d.Cast, o => o.Ignore())
            .ForMember(d => d.Directors, o => o.Ignore())
            .ForMember(d => d.StreamingOptions, o => o.Ignore());

        CreateMap<ContentDetail, ContentPartial>()
            .ForMember(dest => dest.Detail, opt => opt.Ignore())
            .ForMember(dest => dest.Poster, opt => opt.Ignore())
            .ForMember(dest => dest.Lists, opt => opt.Ignore());

        CreateMap<ContentDetail, ContentDTO>()
            .ForMember(dest => dest.VerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.VerticalPoster : string.Empty))
            .ForMember(dest => dest.LargeVerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.LargeVerticalPoster : string.Empty))
            .ForMember(dest => dest.HorizontalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.HorizontalPoster : string.Empty));

        CreateMap<ContentDetail, ContentPartialDTO>()
            .ForMember(dest => dest.VerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.VerticalPoster : string.Empty))
            .ForMember(dest => dest.LargeVerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.LargeVerticalPoster : string.Empty))
            .ForMember(dest => dest.HorizontalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.HorizontalPoster : string.Empty));

        CreateMap<ContentDetail, ContentSimpleDTO>()
            .ForMember(dest => dest.GenreNames,
                        opt => opt.MapFrom(c => c.Genres.Select(g => g.Name))
            ).ForMember(dest => dest.StreamingServiceNames,
                        opt => opt.MapFrom(c => c.StreamingOptions.Select(o => o.StreamingService.Name))
        ).ForMember(dest => dest.VerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.VerticalPoster : string.Empty))
         .ForMember(dest => dest.LargeVerticalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.LargeVerticalPoster : string.Empty))
         .ForMember(dest => dest.HorizontalPoster, opt => opt.MapFrom(src => src.Partial != null && src.Partial.Poster != null ? src.Partial.Poster.HorizontalPoster : string.Empty));


        CreateMap<ContentPartial, ContentPartialDTO>()
            .ForMember(dest => dest.VerticalPoster, opt => opt.MapFrom(src => src.Poster != null ? src.Poster.VerticalPoster : string.Empty))
            .ForMember(dest => dest.LargeVerticalPoster, opt => opt.MapFrom(src => src.Poster != null ? src.Poster.LargeVerticalPoster : string.Empty))
            .ForMember(dest => dest.HorizontalPoster, opt => opt.MapFrom(src => src.Poster != null ? src.Poster.HorizontalPoster : string.Empty));

        CreateMap<ContentPartialDTO, ContentRequestDTO>().ReverseMap();

        CreateMap<Genre, GenreDTO>();
    }
}
